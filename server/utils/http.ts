import { z } from "zod";

export const responseCode = {
    DEFAULT_RESPONSE: 0,
    JWT_EXPIRED: 1,
    INVALID_REFRESH_TOKEN: 2
}

export class HttpError extends Error {
    statusCode: number;
    code: number;

    constructor(message: string, {
        statusCode = 500,
        code = responseCode.DEFAULT_RESPONSE
    } = {}) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

export class ValidationError extends Error {
    errors: Partial<Record<PropertyKey, string[]>>

    constructor(errors: Partial<Record<PropertyKey, string[]>>) {
        super(errors[Object.keys(errors)[0]]?.[0])
        this.errors = errors;
    }
}

export class ZodValidationError extends ValidationError {
    constructor(data: z.ZodError) {
        const messages = data.flatten().fieldErrors
        super(messages)
    }
}
