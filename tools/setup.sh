#!/bin/sh
set -e
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
exec sh "$ROOT/.agents/skills/gptcar/scripts/setup.sh" "$@"
