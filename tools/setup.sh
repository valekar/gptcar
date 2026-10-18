#!/bin/sh
set -e
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
exec sh "$ROOT/.agents/skills/codexcar/scripts/setup.sh" "$@"
