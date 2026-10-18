"""Production instructions must resolve real examples and survive a checkout move."""
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import replica_paths
import style_recipe

spec = importlib.util.spec_from_file_location('recreation_example', ROOT / 'examples/reference-recreation/reproduce.py')
example = importlib.util.module_from_spec(spec)
spec.loader.exec_module(example)

class ProductionRecipes(unittest.TestCase):
    def test_complete_inventory_resolves_real_recorded_artifacts(self):
        self.assertEqual(style_recipe.validate(), 51)

    def test_unknown_style_does_not_resolve_an_arbitrary_path(self):
        with self.assertRaises(ValueError):
            style_recipe.recipe('../../outside')

    def test_workspace_default_tracks_checkout_not_launch_directory(self):
        with tempfile.TemporaryDirectory(prefix='gptcar moved ') as directory:
            root = Path(directory).resolve()
            with patch.object(replica_paths, 'ROOT', root), patch.dict(os.environ, {}, clear=True):
                self.assertEqual(replica_paths.work_root(), root / 'work/replication')
                with patch.dict(os.environ, {'GPTCAR_WORK_DIR': 'other private work'}):
                    self.assertEqual(replica_paths.work_root(), root / 'other private work')
                with patch.dict(os.environ, {'GPTCAR_WORK_DIR': str(root / 'absolute')}):
                    self.assertEqual(replica_paths.work_root(), root / 'absolute')

    def test_bad_asset_download_preserves_existing_file(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            source = root / 'remote'; source.write_bytes(b'wrong response')
            dest = root / 'asset'; dest.write_bytes(b'keep existing file')
            with self.assertRaisesRegex(RuntimeError, 'checksum mismatch'):
                example.download(source.as_uri(), dest, '0' * 64)
            self.assertEqual(dest.read_bytes(), b'keep existing file')
            self.assertFalse(dest.with_name('asset.download').exists())

    def test_verified_asset_download_installs_exact_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            source = root / 'remote'; source.write_bytes(b'verified source')
            dest = root / 'asset'
            example.download(source.as_uri(), dest, example.sha(source))
            self.assertEqual(dest.read_bytes(), source.read_bytes())
