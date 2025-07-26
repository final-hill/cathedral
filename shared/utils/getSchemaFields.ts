import { z } from 'zod'
import { camelCaseToTitleCase } from './camelCaseToTitleCase'

const enumToLabelValue = (enumObject: Readonly<Record<string, any>>) =>
    Object.entries(enumObject).map(([_key, value]) => ({ value, label: value }))

/**
 * Get the fields of a Zod schema as an array of objects with metadata
 * @param schema The Zod schema to get the fields of
 * @returns An array of objects with metadata about the fields of the schema
 */
const getSchemaFields = (schema: z.ZodObject<z.ZodRawShape>) => Object.entries(schema.shape)
    .map(([key, fieldType]) => {
        // Handle wrapped types (Optional, Readonly, etc.)
        let innerType = fieldType
        const isOptional = fieldType instanceof z.ZodOptional
        const isReadOnly = fieldType instanceof z.ZodReadonly

        // Unwrap optional and readonly wrappers to get to the actual type
        if (isOptional) {
            innerType = (fieldType as z.ZodOptional<any>).unwrap()
        }
        if (isReadOnly) {
            innerType = (fieldType as z.ZodReadonly<any>).unwrap()
        }

        // Type detection using instanceof checks
        const isEnum = innerType instanceof z.ZodEnum
        const isObject = innerType instanceof z.ZodObject

        // For enum options, we can safely access the .enum property
        let enumOptions: Array<{ value: any, label: string }> = []
        if (isEnum) {
            enumOptions = enumToLabelValue((innerType as z.ZodEnum<any>).enum)
        }

        let min: number | undefined = undefined
        let max: number | undefined = undefined
        let maxLength: number | undefined = undefined
        let isEmail = false
        let reqType: string | undefined = undefined

        // Extract reqType default value for requirement type fields
        if (fieldType instanceof z.ZodDefault && key === 'reqType') {
            const defaultValue = (fieldType)._zod?.def?.defaultValue
            if (typeof defaultValue === 'function') {
                reqType = defaultValue()
            } else {
                reqType = defaultValue as string
            }
        }

        const checks = (innerType as any)._zod?.def?.checks || []

        for (const check of checks) {
            const checkDef = check._zod?.def || check

            switch (checkDef.check) {
                case 'min_length':
                    min = !min || checkDef.value < min ? checkDef.value : min
                    break
                case 'max_length':
                    maxLength = !maxLength || checkDef.value > maxLength ? checkDef.value : maxLength
                    break
                case 'length_equals':
                    min = checkDef.value
                    maxLength = checkDef.value
                    break
                case 'greater_than':
                    min = !min || checkDef.value + 1 < min ? checkDef.value + 1 : min
                    break
                case 'greater_than_or_equal':
                    min = !min || checkDef.value < min ? checkDef.value : min
                    break
                case 'less_than':
                    max = !max || checkDef.value - 1 > max ? checkDef.value - 1 : max
                    break
                case 'less_than_or_equal':
                    max = !max || checkDef.value > max ? checkDef.value : max
                    break
                case 'string_format':
                    isEmail = checkDef.format === 'email'
                    break
            }
        }

        return {
            key,
            label: camelCaseToTitleCase(key),
            description: (fieldType as { description?: string }).description as string,
            fieldType,
            isOptional,
            isObject,
            reqType,
            isReadOnly,
            innerType,
            min,
            max,
            maxLength,
            isEnum,
            isEmail,
            enumOptions
        } as const
    })

export { getSchemaFields }
