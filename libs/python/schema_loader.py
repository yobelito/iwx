IWX_SCHEMAS = {
    1: {
        "name": "Sale",
        "fields": [
            {"pos": 0, "backend": "tenant_id", "frontend": "tenant"},
            {"pos": 1, "backend": "date", "frontend": "sale_date"},
            {"pos": 2, "backend": "total", "frontend": "amount"},
        ],
    }
}


def get_schema(schema_id: int) -> dict:
    try:
        return IWX_SCHEMAS[schema_id]
    except KeyError:
        raise KeyError(f"Unknown IWX schema: {schema_id}")
