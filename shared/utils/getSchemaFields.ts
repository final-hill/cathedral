import { z } from "zod"
import { camelCaseToTitleCase } from "./camelCaseToTitleCase"

const enumToLabelValue = (enumObject: Record<string, string>) =>
    Object.entries(enumObject).map(([value, label]) => ({ value, label }))

/**
 * Get the fields of a Zod schema as an array of objects with metadata
 * @param schema The Zod schema to get the fields of
 * @returns An array of objects with metadata about the fields of the schema
 */
const getSchemaFields = (schema: z.ZodObject<any>) => Object.entries<z.ZodRawShape>(schema.shape)
    .map(([key, fieldType]) => {
        const isOptional = fieldType instanceof z.ZodOptional ||
            (fieldType instanceof z.ZodString &&
                fieldType._def.checks.reduce(
                    (acc, check) => check.kind === 'min' ? acc || check.value === 0 : acc,
                    !fieldType._def.checks.some(check => check.kind === 'min')
                )
            ),
            isEffect = fieldType instanceof z.ZodEffects,
            isReadOnly = fieldType instanceof z.ZodReadonly,
            innerType = isOptional ? (fieldType instanceof z.ZodOptional ? fieldType._def.innerType : fieldType)
                : isEffect ? fieldType._def.schema
                    : fieldType,
            isEnum = innerType instanceof z.ZodNativeEnum || innerType instanceof z.ZodEnum,
            isObject = innerType instanceof z.ZodObject,
            reqType = isObject ? innerType._def.shape().reqType._def.defaultValue() : undefined,
            maxLength = innerType instanceof z.ZodString ? innerType._def.checks.find(check => check.kind === 'max')?.value : undefined,
            min = innerType instanceof z.ZodNumber ? innerType._def.checks.find(check => check.kind === 'min')?.value : undefined,
            max = innerType instanceof z.ZodNumber ? innerType._def.checks.find(check => check.kind === 'max')?.value : undefined,
            isEmail = innerType instanceof z.ZodString && innerType._def.checks.some(check => check.kind === 'email')

        return {
            key,
            label: camelCaseToTitleCase(key),
            description: (fieldType as any).description as string,
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
            enumOptions: isEnum ? enumToLabelValue((innerType as z.ZodEnum<any>).enum) : []
        } as const
    })

export { getSchemaFields }