<?php

require_once __DIR__ . '/Errors.php';

class IWXBinary
{
    private const MAGIC = "IWX"; // ASCII
    private const VERSION = 0x01;

    public static function encode(array $payload): string
    {
        $values = $payload['_v'] ?? [];
        $body = json_encode($values, JSON_UNESCAPED_SLASHES);
        $header = pack('>3sBHHI', self::MAGIC, self::VERSION, $payload['_s'], count($values), strlen($body));
        return $header . $body;
    }

    public static function decode(string $raw): array
    {
        if (strlen($raw) < 12) {
            throw new IWXError(IWXErrorCodes::BINARY_FORMAT, 'IWX-BIN frame too small');
        }
        [$magic, $version, $schemaId, $count, $len] = unpack('>3sBHHI', substr($raw, 0, 12));
        if ($magic !== self::MAGIC) {
            throw new IWXError(IWXErrorCodes::BINARY_FORMAT, 'Invalid IWX-BIN magic');
        }
        if ($version !== self::VERSION) {
            throw new IWXError(IWXErrorCodes::BINARY_FORMAT, 'Unsupported IWX-BIN version');
        }
        if (strlen($raw) < 12 + $len) {
            throw new IWXError(IWXErrorCodes::BINARY_FORMAT, 'IWX-BIN length mismatch');
        }
        $values = json_decode(substr($raw, 12, $len), true);
        if (is_array($values) && count($values) !== $count) {
            throw new IWXError(IWXErrorCodes::BINARY_FORMAT, 'IWX-BIN value count mismatch', ['expected' => $count, 'got' => count($values)]);
        }
        return ['_s' => $schemaId, '_v' => $values];
    }
}
