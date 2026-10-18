#!/usr/bin/env python3
"""Link this checkout's skill into Codex's user skill directory without replacing anything."""
import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dest', type=Path, default=Path.home() / '.agents/skills',
                        help='parent skill directory (default: ~/.agents/skills)')
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1] / '.agents/skills/gptcar'
    dest = args.dest.expanduser().absolute() / 'gptcar'
    if dest.is_symlink() and dest.resolve() == source:
        print(f'Already installed: {dest}')
        return
    if dest.exists() or dest.is_symlink():
        parser.exit(1, f'Refusing to overwrite {dest}; choose another --dest or move it yourself.\n')
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.symlink_to(source, target_is_directory=True)
    print(f'Installed {dest} -> {source}')
    print('Keep this checkout in place. Invoke $gptcar in Codex; restart if it is not visible.')


if __name__ == '__main__':
    main()
