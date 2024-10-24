import type { EventHandler, EventHandlerRequest } from "h3";

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
                return errorResponse(err.message)
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
