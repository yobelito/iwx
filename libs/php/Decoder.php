<?php

require_once __DIR__ . '/SchemaLoader.php';

class IWXDecoder
{
    public static function decodeToBackend(array $payload): array
    {
        $schemaId = $payload['_s'];
        $values = $payload['_v'];
        $schema = IWXSchemaLoader::getSchema($schemaId);

        $obj = [];
        foreach ($schema['fields'] as $field) {
            $pos = $field['pos'];
            $backend = $field['backend'];
            $obj[$backend] = $values[$pos] ?? null;
        }

        return $obj;
    }
}
