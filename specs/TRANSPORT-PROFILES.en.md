# IWX Transport Profiles

IWX currently defines three transport profiles:

- **IWX-JSON**: uses JSON as a container.
- **IWX-BIN**: uses a compact binary frame.
- **IWX-JSONL**: uses newline-delimited JSON events for streaming.

## 1. IWX-JSON

- `Content-Type: application/vnd.iwx+json`
- Payload shape as described in `IWX-SPEC-v1.0.md`.
- Easy to debug.
- Ideal for public APIs and admin panels.

Example (plain):

```json
{
  "_s": 1,
  "_v": ["t-001", "2025-01-01", 199.9]
}
```

Example (secure):

```json
{
  "_s": 1,
  "_k": "iwx-ks-123",
  "_a": "AES-256-GCM",
  "_iv": "BASE64(iv)",
  "_v": "BASE64(ciphertext)"
}
```

## 2. IWX-BIN (experimental)

- `Content-Type: application/vnd.iwx+bin`
- Uses a binary frame with the following general structure:

```
[MAGIC][VER][SCHEMA_ID][COUNT][VALUES...]
```

Where:

- `MAGIC`: identification bytes, e.g., `0x49 0x57 0x58 0x31` (`"IWX1"`).
- `VER`: binary frame version (1 byte).
- `SCHEMA_ID`: unsigned integer (2 or 4 bytes).
- `COUNT`: number of values (2 bytes).
- `VALUES`: sequence of values encoded with a type tag.

Each value can have the format:

```
[TYPE][LEN][DATA...]
```

where:

- `TYPE`: byte indicating the logical type (string, number, boolean, etc.).
- `LEN`: byte length of `DATA` (for variable-length types).
- `DATA`: bytes of the value.

The exact binary encoding details may evolve in future versions while keeping:

- Backward compatibility whenever possible.
- Semantic alignment with schemas and `schema_id`.

IWX-BIN is intended primarily for:

- Internal service-to-service communication.
- Mobile/edge synchronization.
- Message queues and streaming.

## 3. IWX-JSONL (proposed)

- `Content-Type: application/vnd.iwx+jsonl`
- Based on newline-delimited JSON (`NDJSON`), where each line is an independent IWX payload.
- Ideal for streaming over HTTP chunked responses, WebSockets, or log queues where messages are processed one by one.

Example (two events in the same stream):

```json
{"_s": 1, "_v": ["t-001", "2025-01-01", 199.9]}
{"_s": 1, "_v": ["t-002", "2025-01-02", 59.5]}
```

Implementation guidance:

- Each line must end with `\n` and be valid JSON per `IWX-SPEC-v1.0.md`.
- Consumers should treat each line as a standalone message and validate `_v` length before decoding.
- For secure flows, each line includes `_k`, `_a`, `_iv`, and encrypted `_v` exactly like IWX-JSON.
- Enforce a maximum per-line size to avoid abuse in long-running streams.

Use cases:

- Real-time event or telemetry ingestion.
- Batch jobs processing millions of records without loading the whole file in memory.
- Debugging and replaying traffic by logging each line as a reproducible message.
