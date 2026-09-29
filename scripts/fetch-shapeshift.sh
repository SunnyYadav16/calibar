#!/bin/sh
# Fetch a read-only reference copy of Shapeshift at the pinned commit.
set -eu

SHA=5e24166dcbde6e794f0bd5b1b4bd395aaee5fc19
DEST="$(cd "$(dirname "$0")/.." && pwd)/third_party/shapeshift"

[ -d "$DEST" ] && chmod -R u+w "$DEST" && rm -rf "$DEST"
mkdir -p "$DEST"
git -C "$DEST" init -q
git -C "$DEST" fetch -q --depth 1 https://github.com/anishfn/shapeshift.git "$SHA"
git -C "$DEST" checkout -q FETCH_HEAD
[ "$(git -C "$DEST" rev-parse HEAD)" = "$SHA" ] || { echo "unexpected commit" >&2; exit 1; }
chmod -R a-w "$DEST"
echo "Shapeshift $SHA -> $DEST"
