<?php

require_once __DIR__ . '/Errors.php';

class IWXSchemaLoader
{
    private static array $registry = [];
    private const ALLOWED_TYPES = ['string', 'number', 'integer', 'boolean', 'date', 'object'];

    public static function registerSchema(array $schema): array
    {
        self::validateSchema($schema);
        self::$registry[$schema['schema_id']] = $schema;
        return $schema;
    }

    public static function getSchema(int $schemaId): array
    {
        if (!isset(self::$registry[$schemaId])) {
            throw new IWXError(IWXErrorCodes::SCHEMA_NOT_FOUND, 'Unknown IWX schema: ' . $schemaId);
        }
        return self::$registry[$schemaId];
    }

    public static function loadSchemaFile(string $path, ?callable $yamlParser = null): array
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $contents = file_get_contents($path);
        if ($contents === false) {
            throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Unable to read schema file', ['path' => $path]);
        }
        if ($ext === 'json') {
            $schema = json_decode($contents, true);
        } elseif ($ext === 'yml' || $ext === 'yaml') {
            if ($yamlParser === null) {
                throw new IWXError(
                    IWXErrorCodes::SCHEMA_INVALID,
                    'YAML schema provided but no yamlParser supplied. Pass a callable (e.g. yaml_parse) or pre-convert to JSON.',
                    ['path' => $path]
                );
            }
            $schema = $yamlParser($contents);
        } else {
            throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Unsupported schema file extension', ['path' => $path]);
        }
        return self::registerSchema($schema);
    }

    public static function loadSchemasFromDirectory(string $directory, ?callable $yamlParser = null): array
    {
        $loaded = [];
        foreach (scandir($directory) as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $path = rtrim($directory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $entry;
            if (!is_file($path)) {
                continue;
            }
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            if (!in_array($ext, ['json', 'yml', 'yaml'], true)) {
                continue;
            }
            $loaded[] = self::loadSchemaFile($path, $yamlParser);
        }
        return $loaded;
    }

    private static function validateSchema(array $schema): void
    {
        if (!isset($schema['schema_id'], $schema['fields']) || !is_array($schema['fields'])) {
            throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Schema must include schema_id and fields[]');
        }
        $positions = [];
        foreach ($schema['fields'] as $field) {
            if (!isset($field['pos']) || !is_int($field['pos'])) {
                throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Field is missing numeric pos', ['field' => $field]);
            }
            if (in_array($field['pos'], $positions, true)) {
                throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Duplicate field position', ['pos' => $field['pos']]);
            }
            $positions[] = $field['pos'];
            if (empty($field['frontend']) || empty($field['backend'])) {
                throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Field requires frontend and backend names', ['field' => $field]);
            }
            if (isset($field['type']) && !in_array($field['type'], self::ALLOWED_TYPES, true)) {
                throw new IWXError(IWXErrorCodes::SCHEMA_INVALID, 'Unsupported field type', ['field' => $field]);
            }
        }
    }
}

// preload built-in schema
IWXSchemaLoader::registerSchema([
    'schema_id' => 1,
    'name' => 'Sale',
    'version' => 1,
    'fields' => [
        ['pos' => 0, 'backend' => 'tenant_id', 'frontend' => 'tenant', 'type' => 'string', 'required' => true],
        ['pos' => 1, 'backend' => 'date', 'frontend' => 'sale_date', 'type' => 'date', 'required' => true],
        ['pos' => 2, 'backend' => 'total', 'frontend' => 'amount', 'type' => 'number', 'required' => true],
    ],
]);
