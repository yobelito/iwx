<?php

class IWXSchemaLoader
{
    public static function getSchema(int $schemaId): array
    {
        $schemas = [
            1 => [
                'name' => 'Sale',
                'fields' => [
                    ['pos' => 0, 'backend' => 'tenant_id', 'frontend' => 'tenant'],
                    ['pos' => 1, 'backend' => 'date', 'frontend' => 'sale_date'],
                    ['pos' => 2, 'backend' => 'total', 'frontend' => 'amount'],
                ],
            ],
        ];

        if (!isset($schemas[$schemaId])) {
            throw new \RuntimeException('Unknown IWX schema: ' . $schemaId);
        }

        return $schemas[$schemaId];
    }
}
