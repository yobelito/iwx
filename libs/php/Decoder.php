<?php

require_once __DIR__ . '/SchemaLoader.php';

class IWXDecoder
{
    private static function decode(array $payload, string $target): array
    {
        $schemaId = $payload['_s'];
        $values = $payload['_v'] ?? [];
        $schema = IWXSchemaLoader::getSchema($schemaId);

        $obj = [];
        foreach ($schema['fields'] as $field) {
            $key = $target === 'backend' ? $field['backend'] : $field['frontend'];
            $obj[$key] = $values[$field['pos']] ?? null;
        }
        return $obj;
    }

    public static function decodeToBackend(array $payload): array
    {
        return self::decode($payload, 'backend');
    }

    public static function decodeToFront(array $payload): array
    {
        return self::decode($payload, 'frontend');
    }
}
