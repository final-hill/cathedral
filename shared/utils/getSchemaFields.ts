import { z } from 'zod'
import { camelCaseToTitleCase } from './camelCaseToTitleCase'

const enumToLabelValue = (enumObject: Record<string, string | number> | readonly [string, ...string[]]) => {
        if (Array.isArray(enumObject))
            return enumObject.map(value => ({ value, label: value }))

        return Object.entries(enumObject).map(([_key, value]) => ({ value: String(value), label: String(value) }))
    },
    /**
     * Get the fields of a Zod schema as an array of objects with metadata
     * @param schema The Zod schema to get the fields of
     * @returns An array of objects with metadata about the fields of the schema
     */
    getSchemaFields = (schema: z.ZodObject<z.ZodRawShape>) => Object.entries(schema.shape)
        .filter(([, fieldType]) => fieldType != null) // Filter out undefined field types
        .map(([key, fieldType]) => {
            // Safety check for fieldType
            if (!fieldType) {
                console.warn(`Field type for key "${key}" is missing:`, fieldType)
                return {
                    key,
                    label: camelCaseToTitleCase(key),
                    description: '',
                    fieldType,
                    isOptional: false,
                    isObject: false,
                    isArray: false,
                    isArrayOfObjects: false,
                    reqType: undefined,
                    isReadOnly: false,
                    innerType: fieldType,
                    min: undefined,
                    max: undefined,
                    maxLength: undefined,
                    isEnum: false,
                    isEmail: false,
                    enumOptions: []
                } as const
            }

            const isOptional = fieldType instanceof z.ZodOptional,
                isReadOnly = fieldType instanceof z.ZodReadonly,
                isDefault = fieldType instanceof z.ZodDefault,
                innerType = isOptional
                    ? fieldType._def.innerType
                    : isReadOnly
                        ? fieldType._def.innerType
                        : isDefault
                            ? fieldType._def.innerType
                            : fieldType,
                isEnum = innerType instanceof z.ZodEnum,
                isArray = innerType instanceof z.ZodArray,
                arrayElementType = isArray ? innerType._def.element : undefined,
                isArrayOfObjects = isArray && arrayElementType != null && arrayElementType instanceof z.ZodObject,
                isObject = innerType instanceof z.ZodObject,
                // Use ._def.defaultValue getter to get default values in Zod v4
                reqType = isObject
                    ? innerType.shape?.reqType?._def?.defaultValue
                    : isArrayOfObjects
                        ? arrayElementType.shape?.reqType?._def?.defaultValue
                        : undefined,
                entityType = isObject
                    ? (innerType.shape?.entityType?._def?.defaultValue
                        || innerType.shape?.entityType?._def?.value)
                    : isArrayOfObjects
                        ? (arrayElementType.shape?.entityType?._def?.defaultValue
                            || arrayElementType.shape?.entityType?._def?.value)
                        : undefined,
                // In Zod v4, email can be either:
                // 1. A standalone $ZodEmail schema (z.email())
                // 2. A string schema with a string_format check for "email" (z.string().check(z.email()))
                isEmailType = innerType.constructor?.name === 'ZodEmail',
                // Check if there's a string_format check with format "email" in the checks array
                hasEmailFormatCheck = innerType._zod?.def?.checks?.some?.((check) => {
                    const def = (check as z.core.$ZodCheckStringFormat)._zod.def
                    return def.check === 'string_format' && def.format === 'email'
                }),
                isEmail = isEmailType || hasEmailFormatCheck,
                // Get constraints from checks for number types (less_than, greater_than checks)
                minCheck = innerType._zod?.def?.checks?.find?.(check =>
                    check._zod.def.check === 'greater_than'
                ),
                maxCheck = innerType._zod?.def?.checks?.find?.(check =>
                    check._zod.def.check === 'less_than'
                ),
                min = minCheck ? (minCheck as z.core.$ZodCheckGreaterThan)._zod.def.value as number : undefined,
                max = maxCheck ? (maxCheck as z.core.$ZodCheckLessThan)._zod.def.value as number : undefined,
                // Get max_length check for strings
                maxLengthCheck = innerType._zod?.def?.checks?.find?.(check =>
                    check._zod.def.check === 'max_length'
                ),
                maxLength = maxLengthCheck ? (maxLengthCheck as z.core.$ZodCheckMaxLength)._zod.def.maximum : undefined
            return {
                key,
                label: camelCaseToTitleCase(key),
                description: (fieldType as { description?: string }).description as string,
                fieldType,
                isOptional,
                isObject,
                isArray,
                isArrayOfObjects,
                reqType,
                entityType,
                isReadOnly,
                innerType,
                min,
                max,
                maxLength,
                isEnum,
                isEmail,
                enumOptions: isEnum
                    ? enumToLabelValue(innerType.enum)
                    : []
            } as const
        })

export { getSchemaFields }
