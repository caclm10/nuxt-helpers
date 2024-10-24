import { FetchError } from "ofetch";
import { type Form } from "#ui/types";

export interface HttpResponse<D = any> {
    success: boolean;
    message: string;
    data?: D;
}

type FieldErrors = Partial<Record<PropertyKey, string[]>>

export interface HttpErrorResponse<E extends FieldErrors> extends Omit<FetchError, "data"> {
    data: {
        success: boolean;
        message: string;
        errors: E;
    }
}

export function isHttpError<E extends FieldErrors>(error: unknown): error is HttpErrorResponse<E> {
    if (error instanceof FetchError) {
        const data = error.data
        return data !== null && "success" in data && "message" in data && "errors" in data;
    }

    return false;
}

export function handleValidationError<E extends FieldErrors>(error: HttpErrorResponse<E>, form: Form<any>) {
    if (error?.statusCode === 422) {
        form.setErrors(
            Object.entries(error.data.errors).map((error) => ({
                message: error[1]?.[0]!,
                path: error[0]
            }))
        )
    }
}

export function logError<E extends FieldErrors>(error: HttpErrorResponse<E>, except: number[] = []) {
    if (!error.statusCode || !except.includes(error.statusCode)) {
        console.table(error)
    }
}
