import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import { z } from "zod";

export const defineRequestHandler = <T extends EventHandlerRequest, D>(
    handler: EventHandler<T, D>
): EventHandler<T, D> => {
    return defineEventHandler<T>(async event => {
        try {
            const response = await handler(event)

            return {
                success: true,
                ...response
            }
        } catch (err) {
            if (err instanceof ValidationError) {
                setResponseStatus(event, 422)
                return errorResponse(err.message, { errors: err.errors })
            }

            if (err instanceof HttpError) {
                setResponseStatus(event, err.statusCode)
                return errorResponse(err.message, {
                    code: err.code
                })
            }

            if (err instanceof Error) {
                setResponseStatus(event, 500)
                return errorResponse(err.message)
            }
        }
    })
}

export function defaultResponse<T = any>(message: string, {
    code = responseCode.DEFAULT_RESPONSE,
    data = null as T
} = {}) {
    return {
        code,
        message,
        data: data
    }
}

export function errorResponse(
    message: string | undefined,
    {
        code = responseCode.DEFAULT_RESPONSE,
        errors = {}
    } = {}
) {
    return {
        success: false,
        code,
        message: message || "Unknown error occured.",
        errors
    }
}

export async function validateBody<E extends EventHandlerRequest, S extends z.ZodTypeAny>(
    event: H3Event<E>,
    schema: S
) {
    const result = await readValidatedBody(event, schema.safeParse);

    if (!result.success) {
        throw new ZodValidationError(result.error)
    }

    return result.data as z.infer<S>;
}
