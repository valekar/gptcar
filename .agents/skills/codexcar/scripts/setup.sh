#!/bin/sh
# Codex Car: discover or clone the library; install only requested package tiers.
# check (default), deps [voice] [music], demo <slug>, update.
set -e
REPO=${CODEXCAR_REPO:-https://github.com/valekar/codexcar.git}
cmd=${1:-check}
case "$cmd" in check|deps|demo|update) ;; *) echo "usage: sh setup.sh [check|deps [voice] [music]|demo <slug>|update]" >&2; exit 2;; esac
if [ "$cmd" = deps ]; then
  shift
  for tier in "$@"; do case "$tier" in voice|music) ;; *) echo "unknown dependency tier: $tier" >&2; exit 2;; esac; done
  set -- deps "$@"
else
  set -- "$cmd" "${2:-}"
fi
is_lib() { [ -f "$1/codexcar.json" ] && [ -f "$1/AGENTS.md" ] && [ -d "$1/core/render" ]; }
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
BUNDLED=$(CDPATH= cd -- "$SCRIPT_DIR/../../../.." && pwd -P)
if [ -n "${CODEXCAR_HOME:-}" ]; then LIB=$CODEXCAR_HOME
elif is_lib "$BUNDLED"; then LIB=$BUNDLED
elif top=$(git rev-parse --show-toplevel 2>/dev/null) && is_lib "$top"; then LIB=$top
else LIB=${XDG_DATA_HOME:-$HOME/.local/share}/codexcar
fi
case "$LIB" in /*) ;; *) LIB=$(pwd)/$LIB ;; esac
if ! is_lib "$LIB"; then
  if [ -e "$LIB" ] || [ -L "$LIB" ]; then
    echo "Refusing to replace $LIB: it is not a Codex Car library. Set CODEXCAR_HOME to a new path." >&2
    exit 1
  fi
  command -v git >/dev/null || { echo "git is required to clone Codex Car" >&2; exit 1; }
  mkdir -p "$(dirname -- "$LIB")"
  echo "Downloading Codex Car to $LIB"
  git clone --quiet --depth 1 --branch main "$REPO" "$LIB"
  is_lib "$LIB" || { echo "Clone is not a Codex Car library: $LIB" >&2; exit 1; }
fi
LIB=$(CDPATH= cd -- "$LIB" && pwd -P)
if [ "$cmd" = update ]; then
  [ "$(git -C "$LIB" remote get-url origin)" = "$REPO" ] || { echo "Origin differs from CODEXCAR_REPO; update manually." >&2; exit 1; }
  [ -z "$(git -C "$LIB" status --porcelain)" ] || { echo "Local changes present; update manually." >&2; exit 1; }
  git -C "$LIB" pull --ff-only
fi
if [ "$cmd" = deps ]; then
  command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || { echo "Install Node 20+ first" >&2; exit 1; }
  command -v ffmpeg >/dev/null || { echo "Install ffmpeg first" >&2; exit 1; }
fi

# Installed packages are tracked by content: a marker holds a checksum of the files they came from (and the Python
# version), so a changed package.json or requirements file triggers a reinstall.
sig() { cat "$@" 2>/dev/null | cksum | cut -d' ' -f1; }
pysig() { echo "$(sig "$1")-$("$LIB/.venv/bin/python" -V 2>&1 | cut -d. -f1,2)"; }
req() { [ "$1" = core ] && echo "$LIB/requirements.txt" || echo "$LIB/requirements-$1.txt"; }
node_ok() { [ "$(cat "$LIB/node_modules/.codexcar-ok" 2>/dev/null)" = "$(sig "$LIB/package.json" "$LIB/package-lock.json")" ]; }
py_ok() { [ "$(cat "$LIB/.venv/.codexcar-$1" 2>/dev/null)" = "$(pysig "$(req "$1")")" ]; }
# a Python 3.11+ for the venv when uv is absent; kokoro-onnx (voice tier) needs < 3.14, so those come first
find_py() {
  for c in python3.12 python3.13 python3.11 python3; do
    "$c" -c 'import sys; sys.exit(sys.version_info < (3, 11))' 2>/dev/null && { echo "$c"; return 0; }
  done
  return 1
}

case "$1" in
  deps)
    shift; tiers=core
    for t in "$@"; do case $t in voice|music) tiers="$tiers $t" ;; *) echo "usage: sh setup.sh deps [voice] [music]"; exit 1 ;; esac; done
    cd "$LIB"
    command -v npm >/dev/null || { echo "✗ npm not found: install Node 20+ first"; exit 1; }
    if ! node_ok; then
      npm ci --no-audit --no-fund --loglevel=error
      sig package.json package-lock.json > node_modules/.codexcar-ok
    fi
    node node_modules/playwright-core/cli.js install chromium-headless-shell   # the renderer's browser (a no-op when present)
    # a venv whose Python is gone (after a Python upgrade) can't be repaired in place: make it again
    [ ! -e .venv ] || .venv/bin/python -c pass 2>/dev/null || { echo "! $LIB/.venv is broken; making it again"; rm -rf .venv; }
    if [ ! -x .venv/bin/python ]; then
      if command -v uv >/dev/null; then uv venv --quiet --python 3.12 .venv
      else py=$(find_py) || { echo "✗ Python 3.11+ is needed (or install uv, which fetches it)"; exit 1; }; "$py" -m venv .venv; fi
    fi
    for t in $tiers; do
      py_ok "$t" && continue
      if command -v uv >/dev/null; then uv pip install --quiet --python .venv/bin/python -r "$(req "$t")"
      else .venv/bin/python -m pip install --quiet --disable-pip-version-check -r "$(req "$t")"; fi
      pysig "$(req "$t")" > ".venv/.codexcar-$t"
    done
    case " $tiers " in *" voice "*) [ -f core/tts/kokoro-v1.0.onnx ] && [ -f core/tts/voices-v1.0.bin ] || sh tools/fetch.sh voice ;; esac
    ;;
  demo)
    [ -n "$2" ] && [ -f "$LIB/styles/$2/STYLE.md" ] || { echo "usage: sh setup.sh demo <slug>  (slugs: $LIB/styles/README.md)"; exit 1; }
    echo "demo source: $LIB/styles/$2/demo"
    echo "demo poster: $LIB/styles/$2/poster.jpg"
    ;;
esac

# 2. Tools the pipeline needs (report only; installing them is up to the user)
miss=""
if command -v node >/dev/null; then
  [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || miss="$miss node20+(found $(node -v))"
else miss="$miss node20+"; fi
command -v ffmpeg >/dev/null || miss="$miss ffmpeg"
command -v uv >/dev/null || find_py >/dev/null || miss="$miss python3.11+(or uv)"
[ -n "$miss" ] && echo "! missing:$miss"
node_ok && py_ok core || echo "! packages not installed yet: run 'sh setup.sh deps' (a few minutes) before the first render"
echo "LIB=$LIB"
