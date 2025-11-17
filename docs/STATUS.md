# IWX repository status (v1.0 draft)

## Current contents
- Baseline protocol specifications: `specs/IWX-SPEC-v1.0.md`, `specs/IWX-SECURE-v1.0.md`, `specs/TRANSPORT-PROFILES.md`, `specs/SCHEMA-SPEC.md`.
- Reference schema example (`schemas/sale/schema.json`) and minimal language libraries under `libs/` for JavaScript, Python, and PHP.
- Initial whitepaper draft in `papers/` and example snippets in `examples/`.

## Gaps and missing work
- Robust schema validation (required flags, type enforcement, duplicate positions) was incomplete.
- Secure profile helpers were placeholder-only for PHP and minimal for JS/Python.
- Binary transport (IWX-BIN) framing and codec utilities were absent across languages.
- Error codes and structured exceptions were not exposed by the libraries.
- Documentation was mostly in Spanish and lacked API references, install steps, and roadmap details.

## Completion roadmap
1. **Protocol compliance**: enforce schema validation, required fields, and type checks across encoders/decoders; add structured error codes.
2. **Security profile**: implement AES-256-GCM helpers consistently (key-id, algorithm tag, IV handling) and document operational guidance.
3. **Binary transport**: ship a shared framing (magic + version + schema + counts + JSON-encoded values) with codecs for JS/Python/PHP.
4. **Documentation**: provide English-first README and API/usage guides, with Spanish translation for user-facing docs.
5. **Tooling & tests**: add lightweight tests for schema handling, encoding/decoding, and secure round-trips in each language; introduce CLI stubs (`iwx-inspect`, schema validator) for 1.1 roadmap.
