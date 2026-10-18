"""Check setup location handling, non-destructive installs and out-of-repo skill use."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SETUP = ROOT / '.agents/skills/codexcar/scripts/setup.sh'
INSTALL = ROOT / 'tools/install_codex_skill.py'


class SetupTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='codexcar test ')
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.env = dict(os.environ)
        self.env.pop('CODEXCAR_HOME', None)
        self.env.pop('CODEXCAR_REPO', None)

    def run_setup(self, *args, script=SETUP, **env):
        return subprocess.run(['sh', str(script), *args], cwd=self.base,
                              env=self.env | env, capture_output=True, text=True)

    def test_repo_is_found_from_an_unrelated_folder(self):
        result = self.run_setup('check')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.splitlines()[-1], f'LIB={ROOT}')

    def test_existing_nonlibrary_is_not_replaced(self):
        folder = self.base / 'my files'
        folder.mkdir()
        keep = folder / 'keep.txt'
        keep.write_text('user data')
        result = self.run_setup('check', CODEXCAR_HOME=str(folder))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(keep.read_text(), 'user data')
        self.assertFalse((folder / '.git').exists())

    def test_unknown_command_and_tier_do_not_clone(self):
        destination = self.base / 'not created'
        for args in [('unknown',), ('deps', 'unknown')]:
            result = self.run_setup(*args, CODEXCAR_HOME=str(destination))
            self.assertEqual(result.returncode, 2)
            self.assertFalse(destination.exists())

    def test_clone_from_standalone_skill_and_do_not_update_implicitly(self):
        # A local bare origin exercises the real clone path without network or credentials.
        origin = self.base / 'origin.git'
        subprocess.run(['git', 'init', '--bare', '--initial-branch=main', str(origin)],
                       check=True, capture_output=True)
        seed = self.base / 'seed'
        subprocess.run(['git', 'clone', str(origin), str(seed)], check=True, capture_output=True)
        (seed / 'core/render').mkdir(parents=True)
        (seed / 'core/render/placeholder').touch()
        for name in ['codexcar.json', 'AGENTS.md', 'package.json', 'package-lock.json', 'requirements.txt']:
            (seed / name).write_text('{}')
        subprocess.run(['git', '-C', str(seed), 'add', '.'], check=True, capture_output=True)
        subprocess.run(['git', '-C', str(seed), '-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
                        'commit', '-m', 'Fixture'], check=True, capture_output=True)
        subprocess.run(['git', '-C', str(seed), 'push', 'origin', 'main'], check=True, capture_output=True)
        skill = self.base / 'detached/skills/codexcar/scripts/setup.sh'
        skill.parent.mkdir(parents=True)
        shutil.copy2(SETUP, skill)
        library = self.base / 'data/codexcar'
        env = {'CODEXCAR_HOME': str(library), 'CODEXCAR_REPO': str(origin)}
        result = self.run_setup('check', script=skill, **env)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.splitlines()[-1], f'LIB={library.resolve()}')
        (library / 'AGENTS.md').write_text('local edit')
        result = self.run_setup('check', script=skill, **env)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((library / 'AGENTS.md').read_text(), 'local edit')
        result = self.run_setup('update', script=skill, **env)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Local changes', result.stderr)

    def test_installer_is_idempotent_and_refuses_conflicts(self):
        dest = self.base / 'skills'
        command = ['python3', str(INSTALL), '--dest', str(dest)]
        for _ in range(2):
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
        link = dest / 'codexcar'
        self.assertEqual(link.resolve(), ROOT / '.agents/skills/codexcar')
        result = self.run_setup('check', script=link / 'scripts/setup.sh')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.splitlines()[-1], f'LIB={ROOT}')
        link.unlink()
        link.mkdir()
        (link / 'keep').write_text('user data')
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual((link / 'keep').read_text(), 'user data')


if __name__ == '__main__':
    unittest.main()
