import { z } from 'zod'
import { camelCaseToTitleCase } from './camelCaseToTitleCase'

const enumToLabelValue = (enumObject: Record<string, string>) =>
        Object.entries(enumObject).map(([_key, value]) => ({ value, label: value })),
    /**
     * Get the fields of a Zod schema as an array of objects with metadata
     * @param schema The Zod schema to get the fields of
     * @returns An array of objects with metadata about the fields of the schema
     */
    getSchemaFields = (schema: z.ZodObject<z.ZodRawShape>) => Object.entries(schema.shape)
        .filter(([, fieldType]) => fieldType != null) // Filter out undefined field types
        .map(([key, fieldType]) => {
            // Safety check for fieldType._def
            if (!fieldType || !fieldType._def) {
                console.warn(`Field type for key "${key}" is missing _def property:`, fieldType)
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

            const isOptional = fieldType instanceof z.ZodOptional
                || (fieldType instanceof z.ZodString
                    && fieldType._def.checks.reduce(
                        // eslint-disable-next-line max-params
                        (acc, check) => check.kind === 'min' ? acc || check.value === 0 : acc,
                        !fieldType._def.checks.some(check => check.kind === 'min')
                    )
                ),
                isReadOnly = fieldType instanceof z.ZodReadonly,
                isDefault = fieldType instanceof z.ZodDefault,
                innerType = isOptional
                    ? (fieldType instanceof z.ZodOptional ? fieldType._def.innerType : fieldType)
                    : isReadOnly
                        ? fieldType._def.innerType
                        : isDefault
                            ? fieldType._def.innerType
                            : fieldType,
                isEnum = innerType instanceof z.ZodNativeEnum || innerType instanceof z.ZodEnum,
                isArray = innerType instanceof z.ZodArray,
                arrayElementType = isArray ? innerType._def.type : undefined,
                isArrayOfObjects = isArray && arrayElementType instanceof z.ZodObject,
                isObject = innerType instanceof z.ZodObject,
                reqType = isObject
                    ? innerType._def?.shape()?.reqType?._def?.defaultValue?.()
                    : isArrayOfObjects
                        ? arrayElementType._def?.shape()?.reqType?._def?.defaultValue?.()
                        : undefined,
                entityType = isObject
                    ? (innerType._def?.shape()?.entityType?._def?.defaultValue?.()
                        || innerType._def?.shape()?.entityType?._def?.value)
                    : isArrayOfObjects
                        ? (arrayElementType._def?.shape()?.entityType?._def?.defaultValue?.()
                            || arrayElementType._def?.shape()?.entityType?._def?.value)
                        : undefined,
                maxLength = innerType instanceof z.ZodString ? innerType._def.checks.find(check => check.kind === 'max')?.value : undefined,
                min = innerType instanceof z.ZodNumber ? innerType._def.checks.find(check => check.kind === 'min')?.value : undefined,
                max = innerType instanceof z.ZodNumber ? innerType._def.checks.find(check => check.kind === 'max')?.value : undefined,
                isEmail = innerType instanceof z.ZodString && innerType._def.checks.some(check => check.kind === 'email')

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
                    ? innerType instanceof z.ZodNativeEnum
                        ? enumToLabelValue(innerType._def.values)
                        : enumToLabelValue((innerType as z.ZodEnum<[string, ...string[]]>).enum)
                    : []
            } as const
        })

export { getSchemaFields }
