#!/usr/bin/env python3
"""Read-only distribution integrity checks; no browser or usability claims."""
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import zipfile

root = Path(__file__).resolve().parents[1]
package = root / 'packages/ui-delivery'
manifest = json.loads((root / 'dist/manifest.json').read_text())
digest = lambda data: hashlib.sha256(data).hexdigest()
actual = {p.relative_to(package).as_posix(): digest(p.read_bytes())
          for p in package.rglob('*') if p.is_file()}
assert actual == manifest['files'], 'Package files differ from manifest'
assert digest(json.dumps(actual, sort_keys=True, separators=(',', ':')).encode()) == manifest['package_hash'], 'Package hash differs'
archive = root / 'dist' / manifest['archive']
assert digest(archive.read_bytes()) == manifest['archive_sha256'], 'Archive hash differs'
with zipfile.ZipFile(archive) as bundle:
    names = [n for n in bundle.namelist() if not n.endswith('/')]
    assert len(names) == len(set(names)), 'Duplicate archive paths'
    assert set(names) == {'ui-delivery/' + n for n in actual}, 'Unexpected archive members'
    for name, expected in actual.items():
        assert digest(bundle.read('ui-delivery/' + name)) == expected, name

documents = [root / 'README.md', *sorted((root / 'docs').glob('*.md')),
             *sorted(package.rglob('*.md'))]
for document in documents:
    for raw in re.findall(r'\]\(([^\s)]+)\)', document.read_text()):
        link = urlsplit(raw)
        if link.scheme or not link.path:
            continue
        target = (document.parent / unquote(link.path)).resolve()
        assert target.is_relative_to(root.resolve()), f'Escaping link: {document}: {raw}'
        assert target.exists(), f'Missing link: {document}: {raw}'
print(f"PASS: {manifest['package_revision']}; {len(actual)} package files; archive, hashes and relative documentation links match.")
