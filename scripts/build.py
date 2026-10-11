#!/usr/bin/env python3
"""Build a deterministic local skill archive; install nothing."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import zipfile

sys.dont_write_bytecode = True
root = Path(__file__).resolve().parents[1]
package = root / 'packages/ui-delivery'
spec = importlib.util.spec_from_file_location('validator', package / 'scripts/validate.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
validator.validate_package(package)
files = sorted(p for p in package.rglob('*') if p.is_file())
manifest = {str(p.relative_to(package)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
package_hash = hashlib.sha256(json.dumps(manifest, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
out = root / 'dist'
out.mkdir(exist_ok=True)
archive = out / f'ui-delivery-{validator.VERSION}.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
    for path in files:
        info = zipfile.ZipInfo('ui-delivery/' + str(path.relative_to(package)), (2026, 10, 10, 0, 0, 0))
        info.external_attr = 0o100644 << 16
        info.compress_type = zipfile.ZIP_DEFLATED
        bundle.writestr(info, path.read_bytes())
receipt = dict(package_revision=validator.VERSION, package_hash=package_hash,
               hash_method='SHA-256 of sorted compact JSON mapping relative path to file SHA-256',
               archive=archive.name, archive_sha256=hashlib.sha256(archive.read_bytes()).hexdigest(),
               source_registry_hash=manifest['references/sources.json'], files=manifest)
(out / 'manifest.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({k: value for k, value in receipt.items() if k != 'files'}, indent=2))
