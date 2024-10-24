import { z } from "zod";

interface RulesOptions {
    required?: boolean;
}

interface UniqueOptions {
    ignoreColumn?: string;
    ignoreValue?: string | number;
}

export function $zString(
    field: string,
    opts: RulesOptions = {
        required: true
    }) {
    let _validator: z.ZodString | z.ZodEffects<z.ZodString> = z.string({
        required_error: opts.required ? `The ${field} field is required.` : undefined
    });

    return {
        done() {
            return _validator;
        },

        required() {
            if (_validator instanceof z.ZodString) {
                _validator = _validator.min(1, { message: `The ${field} field is required.` })
            }

            return this;
        },

        min(value: number) {
            if (_validator instanceof z.ZodString) {
                _validator = _validator.min(value, { message: `The ${field} field must be at least ${value} characters.` })
            }

            return this;
        },

        max(value: number) {
            if (_validator instanceof z.ZodString) {
                _validator = _validator.max(value, { message: `The ${field} field must not be greater than ${value} characters.` })
            }

            return this;
        },

        email() {
            if (_validator instanceof z.ZodString) {
                _validator = _validator.email({
                    message: `The ${field} field must be a valid email address.`
                });
            }

            return this;
        },

        unique(table: string, column: string, opts: UniqueOptions = {}) {
            _validator = _validator.refine(value => {
                // Check DB
                return true;
            }, {
                message: `The ${field} has already been taken.`
            }) as z.ZodEffects<z.ZodString>

            return this;
        },
    }
}
