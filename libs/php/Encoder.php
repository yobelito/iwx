<?php

require_once __DIR__ . '/SchemaLoader.php';

class IWXEncoder
{
    public static function encodePlain(int $schemaId, array $frontObject): array
    {
        $schema = IWXSchemaLoader::getSchema($schemaId);
        $maxPos = 0;
        foreach ($schema['fields'] as $field) {
            if ($field['pos'] > $maxPos) {
                $maxPos = $field['pos'];
            }
        }
        $values = array_fill(0, $maxPos + 1, null);

        foreach ($schema['fields'] as $field) {
            $pos = $field['pos'];
            $key = $field['frontend'];
            $values[$pos] = $frontObject[$key] ?? null;
        }

        return [
            '_s' => $schemaId,
            '_v' => $values,
        ];
    }
}
