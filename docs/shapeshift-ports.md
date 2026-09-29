# Shapeshift ports

Every port from Shapeshift starts from one commit:

`5e24166dcbde6e794f0bd5b1b4bd395aaee5fc19`

The commit and Shapeshift's MIT notice are recorded in `THIRD_PARTY_NOTICES`.

## Reference copy

`scripts/fetch-shapeshift.sh` checks out that commit, read-only, into
`third_party/shapeshift/`. The folder is git-ignored and sits outside every
build path (Cargo, Bun and uv never look there).

## Header for ported files and tests

```
// Ported from Shapeshift (MIT), https://github.com/anishfn/shapeshift
// Source: <path in Shapeshift>
// Commit: 5e24166dcbde6e794f0bd5b1b4bd395aaee5fc19
```

Use `#` instead of `//` in Python files.
