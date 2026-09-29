# License policy

Rust dependencies may use only the licenses below. `apps/desktop/src-tauri/deny.toml`
enforces this list in CI; the two files must change together.

| License | Note |
|---|---|
| MIT | |
| Apache-2.0 | |
| BSD-2-Clause, BSD-3-Clause | |
| ISC | |
| MPL-2.0 | |
| Unicode-3.0 | Required by Tauri's ICU and URL crates |
| Zlib | Required by `foldhash` |

Any other license needs an ADR in `docs/adr/` before the dependency lands.
Workspace crates are private and are not license-checked.
