#!/usr/bin/env python3
"""Show one style's production criteria and its recorded second-pass example."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def recipe(slug, root=ROOT):
    profiles = json.loads((root / 'styles/production-profiles.json').read_text())['styles']
    if slug not in profiles:
        raise ValueError('Unknown style: ' + slug)
    generation = json.loads((root / 'replicas' / slug / 'generation.json').read_text())
    return dict(
        slug=slug, production=profiles[slug],
        style_guide=f'styles/{slug}/STYLE.md',
        production_findings=f'styles/{slug}/GPT_REPLICATION.md',
        recorded_example=dict(
            scope='Historical source-informed recreation; adapt the technique, not its story, for a new topic.',
            model=generation['model'], reasoning_effort=generation['reasoning_effort'],
            scene_script=f'comparison/matched-briefs/{slug}.md',
            scene_data=f'comparison/matched-briefs/{slug}.json',
            saved_prompt=f'replicas/{slug}/PROMPT.md',
            treatment=f'replicas/{slug}/TREATMENT.md',
            source=f'replicas/{slug}/index.html',
            narration=f'replicas/{slug}/narration.json',
            score=f'replicas/{slug}/score.json',
            credits=f'replicas/{slug}/CREDITS',
            provenance=f'replicas/{slug}/generation.json',
            render=f'comparison/replica-results/{slug}.json',
            review=f'comparison/replica-reviews/{slug}.json',
            shared_components=generation.get('shared_components', [])))

def validate(root=ROOT):
    expected = {s['slug'] for s in json.loads((root / 'gptcar.json').read_text())['styles']}
    actual = json.loads((root / 'styles/production-profiles.json').read_text())['styles']
    if set(actual) != expected:
        raise ValueError('Production profiles must cover exactly the 51 library styles')
    for slug in actual:
        r = recipe(slug, root)
        for key in ['asset_contract', 'material_properties', 'motion_properties', 'review_targets', 'avoid']:
            if not r['production'].get(key):
                raise ValueError(slug + ': missing ' + key)
        for key, value in r.items():
            if key in ['style_guide', 'production_findings'] and not (root / value).is_file():
                raise ValueError('Missing ' + value)
        for key, value in r['recorded_example'].items():
            if key not in ['scope', 'model', 'reasoning_effort', 'shared_components'] and not (root / value).is_file():
                raise ValueError('Missing ' + value)
    return len(actual)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug', nargs='?')
    parser.add_argument('--validate', action='store_true')
    args = parser.parse_args()
    if args.validate:
        print(f'PASS: {validate()} complete production profiles and recorded example paths')
    elif args.slug:
        try:
            print(json.dumps(recipe(args.slug), ensure_ascii=False, indent=2))
        except ValueError as error:
            parser.error(str(error))
    else:
        parser.error('Give a style slug or --validate')
