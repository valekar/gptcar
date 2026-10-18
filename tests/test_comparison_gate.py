import importlib.util,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('gallery_builder',ROOT/'tools/build_comparison.py');builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)

class PublicationGateTests(unittest.TestCase):
    def test_incomplete_movies_cannot_be_published(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'comparison').mkdir()
            catalog=[{'slug':f'style-{i}'} for i in range(51)]
            (root/'comparison/catalog.json').write_text(json.dumps(catalog))
            with patch.object(builder,'ROOT',root):
                with self.assertRaises(SystemExit) as error:builder.build(root/'_site')
            self.assertIn('video not verified',str(error.exception))
            self.assertFalse((root/'_site').exists())

    def test_duplicate_or_truncated_inventory_is_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'comparison').mkdir()
            (root/'comparison/catalog.json').write_text(json.dumps([{'slug':'one'}]*51))
            with patch.object(builder,'ROOT',root):
                with self.assertRaises(SystemExit) as error:builder.build(root/'_site')
            self.assertIn('complete51-style inventory',str(error.exception))
