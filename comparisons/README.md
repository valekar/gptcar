# Independent GPT visual studies

Each style directory holds an independent GPT-6.1 Sol High implementation, a treatment, an original note/effect score, credits, and generation metadata. Evidence-based samples also contain genuine frozen source data and FACTS.md.

The films are compact20-second visual studies with procedural sound and no narration. The left-hand comparison is the original full-length Opus production. Subject or production differences are disclosed in generation.json and on the single-page gallery.

From the repository root, after `sh tools/setup.sh deps`:

```sh
.venv/bin/python tools/render_comparisons.py --only watercolor --jobs 1
```

The renderer writes the finished video to `.release/comparison/watercolor.mp4`, its poster to `.release/comparison/posters/watercolor.jpg`, and verification metadata to `comparison/results/watercolor.json`. Intermediate stills and audio stay in the parent workspace's `work/gptcar/renders/` folder. It uses the actual committed drawing source, not the upstream demo code or an external video model. A source hash mismatch triggers a new render.

The renderer verifies 20seconds,480frames,720p/24fps, H.264 video withAAC sound and no detected black intervals. It does not automatically certify artistic quality. Human/model visual inspection is recorded separately. Final visual-review fields refer to inspection of contact sheets and targeted frames; they are not a claim that a human watched every film in real time.
