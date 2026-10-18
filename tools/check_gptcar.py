#!/usr/bin/env python3
"""Verify the complete upstream style inventory and the Codex entry point."""
import hashlib
import json
from pathlib import Path
import re
import sys
from style_recipe import validate as validate_production_profiles


def check(root):
    manifest = json.loads((root / 'gptcar.json').read_text())
    errors = []
    expected = {s['slug']: s for s in manifest['styles']}
    actual = {p.parent.name: p for p in root.glob('styles/*/style.json')
              if not p.parent.name.startswith('_')}
    if set(expected) != set(actual):
        errors.append(f'Style inventory differs: {set(expected) ^ set(actual)}')
    if len(expected) != manifest['style_count']:
        errors.append('Manifest style_count differs from inventory')
    numbers = set()
    for slug, path in actual.items():
        data = json.loads(path.read_text())
        if data['slug'] != slug or data['num'] in numbers:
            errors.append(f'{slug}: mismatched slug or duplicate number')
        numbers.add(data['num'])
        for file in ['STYLE.md', 'DEMO.md']:
            if not (path.parent / file).is_file():
                errors.append(f'{slug}: missing {file}')
        if not (path.parent / 'demo').is_dir():
            errors.append(f'{slug}: missing demo source directory')
        style = path.with_name('STYLE.md')
        if style.exists() and slug in expected:
            content = style.read_bytes()
            if hashlib.sha256(content).hexdigest() != expected[slug]['style_sha256']:
                errors.append(f'{slug}: style prompt changed from reviewed baseline')
            if re.search(rb'(?i)\b(?:claude|anthropic|opus\s*\d|gpt[- ]?\d|openai)\b', content):
                errors.append(f'{slug}: model-specific text needs compatibility review')
    skill = root / '.agents/skills/gptcar'
    for file in ['SKILL.md', 'scripts/setup.sh', 'agents/openai.yaml']:
        if not (skill / file).is_file():
            errors.append(f'Missing Codex skill file: {file}')
    for file in ['AGENTS.md', 'DIRECTOR.md', 'TECHNIQUE.md', 'NOTICE', 'LICENSE']:
        if not (root / file).is_file():
            errors.append(f'Missing library document: {file}')
    package = json.loads((root / 'package.json').read_text())
    lock = json.loads((root / 'package-lock.json').read_text())
    if package['name'] != 'gptcar' or lock['packages']['']['name'] != package['name']:
        errors.append('Package / lockfile names disagree')
    if 'Copyright (c) 2026 LemoLab' not in (root / 'LICENSE').read_text():
        errors.append('Original copyright notice missing')
    try:
        validate_production_profiles(root)
    except (ValueError, KeyError, FileNotFoundError) as error:
        errors.append('Production profile/example inventory: ' + str(error))
    return errors


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    errors = check(root)
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        sys.exit(1)
    print('PASS: all 51 style prompts match the reviewed baseline; Codex entry point and provenance intact.')
