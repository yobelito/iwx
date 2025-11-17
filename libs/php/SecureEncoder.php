<?php

require_once __DIR__ . '/Encoder.php';
require_once __DIR__ . '/Decoder.php';
require_once __DIR__ . '/Errors.php';

class IWXSecureEncoder
{
    private static function ensureKeyLength(string $key): void
    {
        if (strlen($key) !== 32) {
            throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Secure profile expects 32-byte key');
        }
    }

    public static function encryptValues(array $values, string $key): array
    {
        self::ensureKeyLength($key);
        $iv = random_bytes(12);
        $plaintext = json_encode($values, JSON_UNESCAPED_SLASHES);
        $tag = '';
        $ciphertext = openssl_encrypt($plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        return [
            'iv' => base64_encode($iv),
            'data' => base64_encode($ciphertext . $tag),
        ];
    }

    public static function decryptValues(string $ivB64, string $dataB64, string $key): array
    {
        self::ensureKeyLength($key);
        $iv = base64_decode($ivB64, true);
        $raw = base64_decode($dataB64, true);
        $ciphertext = substr($raw, 0, -16);
        $tag = substr($raw, -16);
        $plaintext = openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        if ($plaintext === false) {
            throw new IWXError(IWXErrorCodes::DECRYPTION_FAILED, 'Unable to decrypt IWX payload');
        }
        return json_decode($plaintext, true);
    }

    public static function wrapSecure(int $schemaId, array $frontObject, string $key, string $keyId, string $source = 'frontend', string $algorithm = 'AES-256-GCM'): array
    {
        $plain = IWXEncoder::encodePlain($schemaId, $frontObject, $source);
        $encrypted = self::encryptValues($plain['_v'], $key);
        return ['_s' => $schemaId, '_k' => $keyId, '_a' => $algorithm, '_iv' => $encrypted['iv'], '_v' => $encrypted['data']];
    }

    public static function unwrapSecure(array $payload, string $key, string $target = 'frontend'): array
    {
        $values = self::decryptValues($payload['_iv'], $payload['_v'], $key);
        if ($target === 'backend') {
            return IWXDecoder::decodeToBackend(['_s' => $payload['_s'], '_v' => $values]);
        }
        return IWXDecoder::decodeToFront(['_s' => $payload['_s'], '_v' => $values]);
    }
}
