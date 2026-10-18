"""Publication must never relabel an abbreviated or unreviewed film as complete."""
import importlib.util,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
MODULE=Path(__file__).resolve().parents[1]/'tools/build_replication.py'
spec=importlib.util.spec_from_file_location('replication_builder',MODULE);B=importlib.util.module_from_spec(spec);spec.loader.exec_module(B)
class PublicationGate(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.root=Path(self.tmp.name);self.catalog=[]
  for path in ['comparison/site','comparison/replica-results','comparison/replica-reviews','.release/replicas/posters','.release/replicas/reference-posters','comparison/matched-briefs']:(self.root/path).mkdir(parents=True)
  for n in ['index.html','app.js','style.css']:(self.root/'comparison/site'/n).write_text('fixture')
  for i in range(51):
   slug=f'style-{i}';self.catalog.append({'slug':slug});folder=self.root/'replicas'/slug;folder.mkdir(parents=True);(folder/'generation.json').write_text('{}');brief=self.root/'comparison/matched-briefs'/f'{slug}.json';brief.write_text('{}')
   movie=self.root/'.release/replicas'/f'{slug}.mp4';movie.write_bytes(b'movie');poster=self.root/'.release/replicas/posters'/f'{slug}.jpg';poster.write_bytes(b'poster');original=self.root/'.release/replicas/reference-posters'/f'{slug}.jpg';original.write_bytes(b'original')
   result=dict(source_sha256='current',matched_brief_sha256=B.sha(brief),status='rendered',model='gpt-6.1-sol',reasoning_effort='high',frames=2700,fps=60,width=1280,height=720,duration=45,title=slug,video_sha256=B.sha(movie),poster_sha256=B.sha(poster),reference_poster_sha256=B.sha(original))
   self.write('replica-results',slug,result);self.write('replica-reviews',slug,dict(verdict='accepted-for-gallery',reviewed_source_sha256='current',audio_review='passed'))
  (self.root/'comparison/catalog.json').write_text(json.dumps(self.catalog));self.ref=dict(video_duration=45,frame_count=2700,fps_number=60,width=1280,height=720)
 def write(self,kind,slug,obj):(self.root/'comparison'/kind/f'{slug}.json').write_text(json.dumps(obj))
 def build(self):
  with patch.object(B,'ROOT',self.root),patch.object(B,'reference',return_value=self.ref),patch.object(B,'source_hash',return_value='current'):return B.build(self.root/'site')
 def change(self,kind,**fields):
  p=self.root/'comparison'/kind/'style-0.json';a=json.loads(p.read_text());a.update(fields);p.write_text(json.dumps(a))
 def test_accepts_all_full_current_reviewed_films(self):self.assertEqual(len(self.build()),51);self.assertEqual(len(list((self.root/'site/films').glob('*.mp4'))),51)
 def test_rejects_twenty_second_study(self):
  self.change('replica-results',duration=20,frames=480,fps=24)
  with self.assertRaisesRegex(SystemExit,'reference delivery format mismatch'):self.build()
 def test_rejects_changed_source_after_review(self):
  self.change('replica-results',source_sha256='older')
  with self.assertRaisesRegex(SystemExit,'stale film source'):self.build()
 def test_rejects_missing_audio_acceptance(self):
  self.change('replica-reviews',audio_review='pending')
  with self.assertRaisesRegex(SystemExit,'scene/audio review incomplete'):self.build()
 def test_rejects_wrong_model(self):
  self.change('replica-results',model='unknown')
  with self.assertRaisesRegex(SystemExit,'unverified model'):self.build()
if __name__=='__main__':unittest.main()
