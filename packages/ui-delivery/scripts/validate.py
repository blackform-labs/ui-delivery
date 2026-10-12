#!/usr/bin/env python3
"""Offline schema-1 record/link checks. No design score or acceptance inference."""
import argparse
import hashlib
import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import unquote, urlparse

VERSION = '0.11.0'
METHODS = {'automated', 'design-review', 'human-task'}
ID = re.compile(r'^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$')


class Invalid(ValueError):
    pass


def need(ok, message):
    if not ok:
        raise Invalid(message)


def obj(value, fields, where):
    need(isinstance(value, dict), f'{where}: expected object')
    for field in fields.split():
        need(field in value, f'{where}: missing {field}')


def string(value, where):
    need(isinstance(value, str) and bool(value.strip()), f'{where}: expected nonempty string')


def array(value, where, nonempty=False):
    need(isinstance(value, list), f'{where}: expected array')
    need(not nonempty or bool(value), f'{where}: empty array')
    return value


def strings(value, where, nonempty=False):
    for item in array(value, where, nonempty):
        string(item, where)


def integer(value, where):
    need(type(value) is int and value > 0, f'{where}: expected positive integer')


def iso_date(value, where):
    string(value, where)
    try:
        need(date.fromisoformat(value).isoformat() == value, f'{where}: invalid date')
    except ValueError:
        raise Invalid(f'{where}: invalid date')


def schema(value, where):
    obj(value, 'schema_version', where)
    need(type(value['schema_version']) is int and value['schema_version'] == 1,
         f'{where}: unsupported schema_version')


def unknowns(value):
    reasons = value.get('unknown_reasons', {})
    need(isinstance(reasons, dict), 'unknown_reasons: expected object')
    def walk(node, path=''):
        if node is None:
            string(reasons.get(path), f'{path}: null needs unknown_reasons entry')
        elif isinstance(node, dict):
            for key, child in node.items():
                if key != 'unknown_reasons':
                    walk(child, f'{path}.{key}' if path else key)
        elif isinstance(node, list):
            for index, child in enumerate(node):
                walk(child, f'{path}.{index}')
    walk(value)


def records(root, key, required):
    schema(root, key)
    obj(root, key, key)
    found = {}
    for item in array(root[key], key, True):
        obj(item, 'id ' + required, key)
        rid = item['id']
        need(isinstance(rid, str) and ID.fullmatch(rid), f'{key}: invalid ID')
        need(rid not in found, f'{key}: duplicate ID {rid}')
        found[rid] = item
    unknowns(root)
    return found


def external(value):
    parsed = urlparse(value)
    return parsed.scheme == 'https' and bool(parsed.netloc)


def link(value, root):
    string(value, 'link')
    if external(value):
        return
    parsed = urlparse(value)
    need(not parsed.scheme and not parsed.netloc, f'unsupported link: {value}')
    path = Path(unquote(parsed.path))
    need(not path.is_absolute(), f'absolute local link: {value}')
    target = root / path
    need(not any(p.is_symlink() for p in [target, *target.parents]), f'symlink link: {value}')
    need(target.resolve().is_relative_to(root.resolve()), f'escaping link: {value}')
    need(target.exists(), f'dangling link: {value}')


def load(path):
    return json.loads(path.read_text())


def validate_package(package):
    package = package.resolve()
    refs = package / 'references'
    sources = load(refs / 'sources.json')
    obj(sources, 'reviewed_on', 'sources')
    iso_date(sources['reviewed_on'], 'reviewed_on')
    source_map = records(sources, 'sources', 'title publisher url section kind version checked_on retrieval summary applies_to limits capture')
    for sid, source in source_map.items():
        for key in 'title publisher url section kind retrieval summary limits capture'.split():
            string(source[key], f'{sid}.{key}')
        if source['version'] is not None:
            string(source['version'], f'{sid}.version')
        need(external(source['url']), f'{sid}: canonical HTTPS URL required')
        need(source['kind'] in {'standard', 'guidance', 'tool-documentation'}, f'{sid}: invalid source kind')
        iso_date(source['checked_on'], sid)
        strings(source['applies_to'], sid, True)
    rule_map = records(load(refs / 'rules.json'), 'rules', 'revision statement origin source_ids applies_when level verification exceptions examples')
    for rid, rule in rule_map.items():
        integer(rule['revision'], rid)
        for key in 'statement applies_when exceptions'.split():
            string(rule[key], f'{rid}.{key}')
        need(rule['origin'] in {'source-derived', 'team-policy'}, f'{rid}: invalid origin')
        need(rule['level'] in {'required', 'advisory'}, f'{rid}: invalid level')
        strings(rule['source_ids'], rid, rule['origin'] == 'source-derived')
        need(all(s in source_map for s in rule['source_ids']), f'{rid}: dangling source')
        if rule['origin'] == 'team-policy':
            string(rule.get('rationale'), f'{rid}.rationale')
        for check in array(rule['verification'], rid, True):
            obj(check, 'method observe', rid)
            need(check['method'] in METHODS, f'{rid}: invalid method')
            string(check['observe'], rid)
        obj(rule['examples'], 'good failure', rid)
        for example in rule['examples'].values():
            string(example, rid)
    adapter_map = records(load(refs / 'adapters.json'), 'adapters', 'revision matches required_capabilities source_ids rule_mapping verification_methods limitations support')
    for aid, adapter in adapter_map.items():
        integer(adapter['revision'], aid)
        string(adapter['matches'], aid)
        for field in ['required_capabilities', 'source_ids', 'verification_methods', 'limitations']:
            strings(adapter[field], f'{aid}.{field}', True)
        need(all(s in source_map for s in adapter['source_ids']), f'{aid}: dangling source')
        need(all(m in METHODS for m in adapter['verification_methods']), f'{aid}: invalid verification method')
        for mapping in array(adapter['rule_mapping'], aid, True):
            obj(mapping, 'rule_id interpretation', aid)
            need(mapping['rule_id'] in rule_map, f'{aid}: dangling rule')
            string(mapping['interpretation'], aid)
        support = adapter['support']
        obj(support, 'documentation_status implementation_evidence usability_evidence', aid)
        need(support['documentation_status'] in {'unreviewed', 'reviewed-scoped', 'reviewed'}, f'{aid}: invalid documentation status')
        for entry in array(support['implementation_evidence'], aid):
            obj(entry, 'os framework_version runtime fixture_revision checks results', aid)
            for key in ['os', 'framework_version', 'runtime', 'fixture_revision']:
                string(entry[key], aid)
            strings(entry['checks'], aid, True)
            strings(entry['results'], aid, True)
        for entry in array(support['usability_evidence'], aid):
            human_context(entry)
    for path in sorted(package.rglob('*')):
        need(not path.is_symlink(), f'symlink in package: {path.name}')
        if path.is_file() and path.suffix == '.md':
            for target in re.findall(r'\]\(([^\s]+)\)', path.read_text()):
                # Markdown paths resolve relative to each document but remain inside package.
                parsed = urlparse(target)
                if not parsed.scheme and parsed.path:
                    need(not Path(unquote(parsed.path)).is_absolute(), f'absolute Markdown link: {target}')
                    resolved = path.parent / unquote(parsed.path)
                    need(resolved.resolve().is_relative_to(package), f'escaping Markdown link: {target}')
                    need(resolved.is_file(), f'dangling Markdown link: {target}')
                else:
                    need(external(target) or target.startswith('#'), f'unsupported Markdown link: {target}')
    validate_profile(load(refs / 'product-profile.json'), refs)
    digest = hashlib.sha256((refs / 'sources.json').read_bytes()).hexdigest()
    validate_evidence(load(refs / 'evidence-template.json'), rule_map, adapter_map, digest, refs, template=True)
    return rule_map, adapter_map, digest


def validate_profile(profile, artifact_root):
    schema(profile, 'profile')
    obj(profile, 'product_id audience primary_tasks surfaces identity_references constraints existing_components accepted_patterns acceptance_owner', 'profile')
    unknowns(profile)
    if 'interaction' in profile:
        validate_interaction(profile['interaction'], artifact_root)
    need(isinstance(profile['product_id'], str) and ID.fullmatch(profile['product_id']), 'profile: invalid product_id')
    for key in ['audience', 'acceptance_owner']:
        if profile[key] is not None:
            string(profile[key], key)
    strings(profile['primary_tasks'], 'primary_tasks')
    strings(profile['existing_components'], 'existing_components')
    obj(profile['constraints'], 'data_sensitivity permitted_test_environments', 'constraints')
    if profile['constraints']['data_sensitivity'] is not None:
        string(profile['constraints']['data_sensitivity'], 'data_sensitivity')
    strings(profile['constraints']['permitted_test_environments'], 'permitted_test_environments')
    if 'layout_policy' in profile['constraints']:
        policy = profile['constraints']['layout_policy']
        obj(policy, 'application reading comparison exceptions', 'layout_policy')
        for key in ['application', 'reading', 'comparison']:
            string(policy[key], f'layout_policy.{key}')
        for exception in array(policy['exceptions'], 'layout_policy.exceptions'):
            obj(exception, 'scope rationale owner_decision remaining_risk review_trigger_or_date', 'layout exception')
            for key in ['scope', 'rationale', 'owner_decision', 'remaining_risk', 'review_trigger_or_date']:
                string(exception[key], f'layout exception.{key}')
    for ref in array(profile['identity_references'], 'identity_references'):
        link(ref, artifact_root)
    for surface in array(profile['surfaces'], 'surfaces'):
        obj(surface, 'platform renderer framework framework_version input_methods target_sizes accessibility_settings', 'surface')
        for key in ['platform', 'renderer', 'framework', 'framework_version']:
            if surface[key] is not None:
                string(surface[key], key)
        for key in ['input_methods', 'target_sizes', 'accessibility_settings']:
            strings(surface[key], key)
    for pattern in array(profile['accepted_patterns'], 'accepted_patterns'):
        obj(pattern, 'scope decision rationale evidence owner status', 'pattern')
        for key in ['scope', 'decision', 'rationale']:
            string(pattern[key], key)
        need(pattern['status'] in {'proposed', 'accepted', 'rejected'}, 'pattern: invalid status')
        if pattern['owner'] is not None:
            string(pattern['owner'], 'owner')
        refs = array(pattern['evidence'], 'pattern.evidence', pattern['status'] == 'accepted')
        for ref in refs:
            link(ref, artifact_root)
        if pattern['status'] == 'accepted':
            string(pattern['owner'], 'accepted pattern owner')


def validate_interaction(value, root):
    schema(value, 'interaction')
    obj(value, 'sessions', 'interaction')
    need(isinstance(value['sessions'], dict), 'interaction.sessions: expected object')
    for sid, session in value['sessions'].items():
        need(ID.fullmatch(sid), 'interaction: invalid session ID')
        obj(session, 'id brief revision decision_revision status events results', sid)
        need(session['id'] == sid, 'session ID mismatch')
        need(session['status'] in {'open', 'cancelled'}, 'invalid session status')
        for field in ['revision', 'decision_revision']:
            need(type(session[field]) is int and session[field] >= 0, 'invalid session revision')
        brief = session['brief']
        obj(brief, 'title scope facts questions screens', 'brief')
        need(brief['scope'] in {'tiny', 'specified', 'material'}, 'invalid brief scope')
        for fact in array(brief['facts'], 'facts'):
            obj(fact, 'label value status source', 'fact')
            need(fact['status'] in {'confirmed', 'inference'}, 'invalid fact provenance')
            for field in ['label', 'value', 'source']:
                string(fact[field], field)
        seen = set()
        for event in array(session['events'], 'events'):
            obj(event, 'request_id revision at actor channel type', 'event')
            need(event['revision'] == len(seen) + 1 and event['request_id'] not in seen, 'invalid event sequence')
            seen.add(event['request_id'])
            need(event['type'] in {'answer', 'feedback', 'acceptance', 'cancel', 'resume', 'result', 'work'}, 'invalid event type')
            need(event['channel'] in {'browser', 'chat', 'agent'}, 'invalid event channel')
            string(event['actor'], 'event.actor')
            if event['type'] == 'answer':
                obj(event, 'question_id mode value supersedes', 'answer')
                need(event['mode'] in {'choice', 'text', 'delegate', 'unsure'}, 'invalid answer mode')
            if event['type'] == 'work':
                need(event['channel'] == 'agent' and event.get('status') in {'working', 'blocked'}, 'invalid work update')
                need(type(event.get('decision_revision')) is int and 0 <= event['decision_revision'] <= session['decision_revision'], 'invalid work basis')
                string(event.get('message'), 'work.message')
            if event['type'] == 'acceptance':
                need(event.get('decision') in {'accepted', 'rejected'}, 'invalid acceptance')
                need(any(r['id'] == event.get('result_id') for r in session['results']), 'acceptance lacks result')
        need(session['revision'] == len(seen), 'session revision differs from history')
        previews = [s['preview'] for s in array(brief['screens'], 'screens')]
        previews += [o['preview'] for q in array(brief['questions'], 'questions') for o in q['options'] if 'preview' in o]
        for result in array(session['results'], 'results'):
            obj(result, 'id at basis_revision decision_revision actor summary preview decisions', 'result')
            previews.append(result['preview'])
        for preview in previews:
            obj(preview, 'path label sha256', 'preview')
            link(preview['path'], root)
            need(hashlib.sha256((root / preview['path']).read_bytes()).hexdigest() == preview['sha256'], 'preview hash mismatch')


def human_context(context):
    obj(context, 'task participant_context environment result artifact_handling', 'human context')
    for key in ['task', 'participant_context', 'environment', 'result', 'artifact_handling']:
        string(context[key], f'human context.{key}')


def validate_evidence(evidence, rules, adapters, digest, artifact_root, template=False):
    schema(evidence, 'evidence')
    obj(evidence, 'task_id scope package_revision source_registry_hash profile_revision adapter_revisions environment checks design_review human_acceptance limitations', 'evidence')
    unknowns(evidence)
    need(isinstance(evidence['task_id'], str) and ID.fullmatch(evidence['task_id']), 'evidence: invalid task_id')
    if not template:
        string(evidence['scope'], 'scope')
        need(evidence['source_registry_hash'] == digest, 'evidence: source registry hash mismatch')
    need(evidence['package_revision'] == VERSION, 'evidence: package revision mismatch')
    if evidence['profile_revision'] is not None:
        string(evidence['profile_revision'], 'profile_revision')
    obj(evidence['environment'], '', 'environment')
    need(template or bool(evidence['environment']), 'environment: observed context required')
    obj(evidence['adapter_revisions'], '', 'adapter_revisions')
    for aid, revision in evidence['adapter_revisions'].items():
        need(aid in adapters, f'evidence: unknown adapter {aid}')
        integer(revision, aid)
        need(adapters[aid]['revision'] == revision, f'{aid}: revision mismatch')
    seen = set()
    for check in array(evidence['checks'], 'checks'):
        obj(check, 'id rule_id method status reason artifact observation', 'check')
        cid = check['id']
        need(isinstance(cid, str) and ID.fullmatch(cid), 'check: invalid ID')
        need(cid not in seen, f'check: duplicate ID {cid}')
        seen.add(cid)
        need(check['rule_id'] in rules, f'{cid}: dangling rule')
        need(check['method'] in METHODS, f'{cid}: invalid method')
        need(check['status'] in {'pass', 'fail', 'not-run', 'not-applicable'}, f'{cid}: invalid status')
        string(check['reason'], f'{cid}.reason')
        for key in ['artifact', 'observation']:
            if check[key] is not None:
                string(check[key], f'{cid}.{key}')
        if check['artifact'] is not None:
            link(check['artifact'], artifact_root)
        if check['status'] in {'pass', 'fail'}:
            need(bool(check['artifact'] or check['observation']), f'{cid}: observed evidence required')
        if check['status'] in {'not-run', 'not-applicable'}:
            need(check['artifact'] is None and check['observation'] is None,
                 f'{cid}: unexecuted check cannot carry result evidence; put context in reason')
        if check['method'] == 'human-task' and check['status'] in {'pass', 'fail'}:
            human_context(check.get('human_context'))
    review = evidence['design_review']
    obj(review, 'status findings observation', 'design_review')
    need(review['status'] in {'pending', 'reviewed'}, 'design_review: invalid status')
    findings = array(review['findings'], 'findings')
    need(review['status'] != 'pending' or (not findings and review['observation'] is None), 'pending review has findings')
    if review['status'] == 'reviewed':
        string(review['observation'], 'design_review.observation')
    for finding in findings:
        obj(finding, 'task severity finding', 'finding')
        for key in ['task', 'finding']:
            string(finding[key], key)
        need(finding['severity'] in {'blocker', 'major', 'minor', 'advisory'}, 'invalid severity')
    human = evidence['human_acceptance']
    obj(human, 'status actor date observation', 'human_acceptance')
    need(human['status'] in {'pending', 'accepted', 'rejected'}, 'invalid human acceptance')
    if human['status'] == 'pending':
        need(human['actor'] is None and human['date'] is None and human['observation'] is None, 'pending acceptance has decision metadata')
    else:
        string(human['actor'], 'human actor')
        iso_date(human['date'], 'human date')
        string(human['observation'], 'human observation')
    strings(evidence['limitations'], 'limitations')
    for exception in array(evidence.get('exceptions', []), 'exceptions'):
        obj(exception, 'rule_id scope rationale owner_decision remaining_risk review_trigger_or_date', 'exception')
        need(exception['rule_id'] in rules, 'exception: dangling rule')
        for key in ['scope', 'rationale', 'owner_decision', 'remaining_risk', 'review_trigger_or_date']:
            string(exception[key], key)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--profile', type=Path, action='append', default=[])
    parser.add_argument('--evidence', type=Path, action='append', default=[])
    parser.add_argument('--artifact-root', type=Path)
    args = parser.parse_args()
    try:
        rules, adapters, digest = validate_package(args.package)
        for path in args.profile:
            validate_profile(load(path), args.artifact_root or path.parent)
        for path in args.evidence:
            validate_evidence(load(path), rules, adapters, digest, args.artifact_root or path.parent)
    except (Invalid, OSError, ValueError, TypeError, KeyError) as error:
        print(f'INVALID: {error}', file=sys.stderr)
        return 1
    print(f'VALID: {len(rules)} rules; {len(adapters)} adapter records; '
          f'{len(args.profile)} profiles; {len(args.evidence)} evidence records. Integrity only.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
