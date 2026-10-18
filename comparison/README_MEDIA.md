# Videos inside the repository README

README.md contains all51 comparisons as102 native GitHub video attachments. Each pair places the original Opus5.5 film on the left and the GPT-6.1 Sol High recreation on the right. The category sections expand inside the README; no external gallery is required to play the films. Each player keeps its own audio controls. The separate Pages gallery remains available for synchronized playback.

The attachments are full-length640×360 H.264/AAC previews, with original aspect ratio preserved and padding when needed. They are compressed for the README and GitHub's upload limit. The original and GPT masters are unchanged and linked below every pair. `readme-media.json` records source/preview hashes, sizes and running times; `readme-attachments.json` binds the exact preview bytes to stable GitHub attachment URLs. These URLs are public, not credentials.

GitHub's Markdown renderer removes video tags pointing directly at release/raw-file URLs, but promotes native GitHub attachment URLs to players. Keep the canonical `github.com/user-attachments/assets/…` URLs in Markdown. Never commit the expiring signed playback URLs returned in rendered HTML.

## Update the comparison section

Use the same verified masters as the published gallery. The preparation script expects original MP4s in `work/replication/reference/films/` and GPT masters in `.release/replicas/`. Populate those from the pinned reference/release workflow before preparing previews; do not substitute rejected first-pass studies. Both local media directories remain ignored by Git.

```sh
python3 tools/prepare_readme_videos.py
python3 tools/upload_readme_videos.py
python3 tools/build_readme_comparisons.py
python3 tools/build_readme_comparisons.py --check
```

Preparation never uploads. Uploading is a separate explicit step that requires repository write access using Git's configured GitHub credential helper. It follows the official GitHub CLI attachment upload endpoint, creates no issues/comments, saves each returned URL immediately and reuses matching saved uploads. Changed previews get new uploads; the tool does not delete old attachments or change masters. Never print/store credential values in the manifests.

The builder refuses an incomplete inventory, non-attachment URLs, changed source/preview hashes or shortened running times. The generated README block is marked with `readme-comparisons:start/end`; keep prose outside that block when editing by hand. Validate actual rendered GitHub players and playback after an update, because local Markdown applications differ.
