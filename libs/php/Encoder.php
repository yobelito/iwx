<?php

require_once __DIR__ . '/SchemaLoader.php';

class IWXEncoder
{
    private static function validateValue(array $field, array $frontObject, string $source)
    {
        $key = $source === 'backend' ? $field['backend'] : $field['frontend'];
        $value = $frontObject[$key] ?? null;
        if (($field['required'] ?? false) && ($value === null)) {
            throw new IWXError(IWXErrorCodes::MISSING_REQUIRED, 'Missing required field ' . $key, ['field' => $field]);
        }
        $type = $field['type'] ?? null;
        if ($type && $value !== null) {
            $valid = match ($type) {
                'string' => is_string($value),
                'number' => is_numeric($value),
                'integer' => is_int($value),
                'boolean' => is_bool($value),
                default => true,
            };
            if (!$valid) {
                throw new IWXError(IWXErrorCodes::TYPE_MISMATCH, 'Invalid type for ' . $key, ['expected' => $type]);
            }
        }
        return $value;
    }

    public static function encodePlain(int $schemaId, array $frontObject, string $source = 'frontend'): array
    {
        $schema = IWXSchemaLoader::getSchema($schemaId);
        $values = [];
        foreach ($schema['fields'] as $field) {
            $values[$field['pos']] = null;
        }
        foreach ($schema['fields'] as $field) {
            $values[$field['pos']] = self::validateValue($field, $frontObject, $source);
        }
        return [
            '_s' => $schemaId,
            '_v' => $values,
        ];
    }
}
