<?php

class IWXError extends \RuntimeException
{
    public string $codeId;
    public array $details;

    public function __construct(string $codeId, string $message, array $details = [])
    {
        parent::__construct($message);
        $this->codeId = $codeId;
        $this->details = $details;
    }
}

class IWXErrorCodes
{
    public const SCHEMA_NOT_FOUND = 'IWX_ERROR_SCHEMA_NOT_FOUND';
    public const SCHEMA_INVALID = 'IWX_ERROR_SCHEMA_INVALID';
    public const MISSING_REQUIRED = 'IWX_ERROR_MISSING_REQUIRED';
    public const TYPE_MISMATCH = 'IWX_ERROR_TYPE_MISMATCH';
    public const DECRYPTION_FAILED = 'IWX_ERROR_DECRYPTION_FAILED';
    public const BINARY_FORMAT = 'IWX_ERROR_BINARY_FORMAT';
}
