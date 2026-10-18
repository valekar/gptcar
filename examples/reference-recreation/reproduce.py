#!/usr/bin/env python3
"""Print or run the recorded reference-recreation pipeline for one library style."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools'))
from replica_paths import WORK_ROOT
from style_recipe import recipe
from render_replicas import source_hash

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as file:
        for block in iter(lambda: file.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()

def download(url, dest, digest):
    """Atomic download; never replace an existing file on an unverified response."""
    if dest.exists() and sha(dest) == digest:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    temporary = dest.with_name(dest.name + '.download')
    try:
        with urllib.request.urlopen(url, timeout=120) as response, temporary.open('wb') as out:
            while block := response.read(1024 * 1024):
                out.write(block)
        if sha(temporary) != digest:
            raise RuntimeError('Download checksum mismatch: ' + url)
        temporary.replace(dest)
    finally:
        temporary.unlink(missing_ok=True)

def inputs(slug, fetch=False):
    ref = json.loads((ROOT / f'comparison/reference-metadata/{slug}.json').read_text())
    movie = WORK_ROOT / 'reference/films' / (slug + '.mp4')
    manifest = json.loads((ROOT / 'comparison/replication-inputs.json').read_text())
    package = ROOT / '.release' / manifest['asset']
    if fetch:
        download(ref['source_url'], movie, ref['sha256'])
        download('https://github.com/valekar/gptcar/releases/download/comparison-v2/' + manifest['asset'], package, manifest['sha256'])
        subprocess.run([sys.executable, 'tools/restore_replica_inputs.py'], cwd=ROOT, check=True)
    failures = []
    if not movie.is_file() or sha(movie) != ref['sha256']:
        failures.append('Missing/changed original analytical movie: ' + str(movie))
    g = json.loads((ROOT / f'replicas/{slug}/generation.json').read_text())
    for c in g.get('shared_components', []):
        path = c if isinstance(c, str) else c['path']
        if not (ROOT / path.split('::', 1)[0]).exists():
            failures.append('Missing shared input: ' + path)
    result = json.loads((ROOT / f'comparison/replica-results/{slug}.json').read_text())
    if not failures and source_hash(ROOT / 'replicas' / slug, g) != result['source_sha256']:
        failures.append('Source/dependency digest differs from the accepted historical bundle')
    if failures:
        raise RuntimeError('\n'.join(failures))
    print('Verified original movie and complete accepted source/dependency digest:', slug)

def commands(slug):
    py = os.environ.get('GPTCAR_VOICE_PYTHON', str(ROOT / '.venv/bin/python'))
    return dict(
        stills=[py, 'tools/render_replicas.py', slug, '--stills-only'],
        render=[py, 'tools/render_replicas.py', slug],
        speech=[py, 'tools/check_replica_narration.py', slug, '--voice-root', str(WORK_ROOT / 'voices'), '--out', str(WORK_ROOT / 'narration-checks')],
        compare=[py, 'tools/compare_replicas.py', slug])

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    parser.add_argument('--check', action='store_true', help='Verify original movie and frozen source/assets without rendering')
    parser.add_argument('--fetch-inputs', action='store_true', help='Download the SHA-verified analytical original and shared-input archive')
    parser.add_argument('--run', choices=['stills', 'render', 'speech', 'compare'], help='Execute this stage; no automatic acceptance or publishing')
    args = parser.parse_args()
    try:
        r = recipe(args.slug)
        if args.check or args.fetch_inputs or args.run:
            inputs(args.slug, args.fetch_inputs)
        if args.run:
            subprocess.run(commands(args.slug)[args.run], cwd=ROOT, check=True)
        elif not (args.check or args.fetch_inputs):
            print(json.dumps(r, indent=2, ensure_ascii=False))
            print('\nRun commands from:', ROOT)
            for stage, cmd in commands(args.slug).items():
                print(stage + ': ' + shlex.join(cmd))
    except (ValueError, RuntimeError) as error:
        parser.error(str(error))
