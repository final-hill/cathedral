<script setup lang="ts">
// Define the JSON Schema field structure using Zod (with recursion)
export interface JsonSchemaField {
    name: string
    type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'
    description?: string
    required: boolean
    // String constraints
    minLength?: number
    maxLength?: number
    pattern?: string
    format?: 'email' | 'uri' | 'date' | 'date-time' | 'uuid' | 'hostname' | 'ipv4' | 'ipv6'
    // Number constraints
    minimum?: number
    maximum?: number
    exclusiveMinimum?: number
    exclusiveMaximum?: number
    multipleOf?: number
    // Array constraints
    minItems?: number
    maxItems?: number
    uniqueItems?: boolean
    itemType?: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'
    // Enum values
    enumValues?: string[]
    // Recursive properties for object types
    properties?: JsonSchemaField[]
    isExpanded?: boolean
}

// Types for JSON Schema parsing
interface JsonSchemaObject {
    type?: string
    properties?: Record<string, JsonSchemaProperty>
    required?: string[]
}

interface JsonSchemaProperty {
    type?: string
    description?: string
    minLength?: number
    maxLength?: number
    pattern?: string
    format?: string
    minimum?: number
    maximum?: number
    exclusiveMinimum?: number
    exclusiveMaximum?: number
    multipleOf?: number
    minItems?: number
    maxItems?: number
    uniqueItems?: boolean
    items?: JsonSchemaProperty
    enum?: (string | number)[]
    properties?: Record<string, JsonSchemaProperty>
    required?: string[]
}

const props = withDefaults(defineProps<{
        modelValue?: object
        disabled?: boolean
    }>(), {
        disabled: false
    }),
    emit = defineEmits<{
        (event: 'update:modelValue', value: object): void
        (event: 'validation-ready', validator: () => Promise<{ isValid: boolean, message?: string }>): void
    }>(),
    fields = ref<JsonSchemaField[]>([]),
    generateAndEmitSchema = () => {
        const schema = generateJsonSchemaFromFields()
        emit('update:modelValue', schema)
    },
    parseJsonSchemaToFields = (schema: JsonSchemaObject) => {
        if (schema.type === 'object' && schema.properties) {
            fields.value = Object.entries(schema.properties).map(([name, prop]: [string, JsonSchemaProperty]) =>
                parseJsonSchemaProperty(name, prop, (schema.required || []))
            )
        } else
            fields.value = []
    },
    parseJsonSchemaProperty = (name: string, prop: JsonSchemaProperty, required: string[] = []): JsonSchemaField => {
        const fieldType = prop.type || 'string',
            validTypes = ['string', 'number', 'integer', 'boolean', 'object', 'array'] as const,
            type = validTypes.includes(fieldType as typeof validTypes[number]) ? fieldType as typeof validTypes[number] : 'string',

            field: JsonSchemaField = {
                name,
                type,
                description: prop.description,
                required: required.includes(name),
                isExpanded: false
            }

        // Parse type-specific constraints
        if (prop.type === 'string') {
            if (prop.minLength !== undefined) field.minLength = prop.minLength
            if (prop.maxLength !== undefined) field.maxLength = prop.maxLength
            if (prop.pattern) field.pattern = prop.pattern
            if (prop.format) {
                const validFormats = ['email', 'uri', 'date', 'date-time', 'uuid', 'hostname', 'ipv4', 'ipv6'] as const
                if (validFormats.includes(prop.format as typeof validFormats[number]))
                    field.format = prop.format as typeof validFormats[number]
            }
            if (prop.enum) field.enumValues = prop.enum.filter((v): v is string => typeof v === 'string')
        }

        if (prop.type === 'number' || prop.type === 'integer') {
            if (prop.minimum !== undefined) field.minimum = prop.minimum
            if (prop.maximum !== undefined) field.maximum = prop.maximum
            if (prop.exclusiveMinimum !== undefined) field.exclusiveMinimum = prop.exclusiveMinimum
            if (prop.exclusiveMaximum !== undefined) field.exclusiveMaximum = prop.exclusiveMaximum
            if (prop.multipleOf !== undefined) field.multipleOf = prop.multipleOf
            if (prop.enum) field.enumValues = prop.enum.map(v => String(v))
        }

        if (prop.type === 'array') {
            if (prop.minItems !== undefined) field.minItems = prop.minItems
            if (prop.maxItems !== undefined) field.maxItems = prop.maxItems
            if (prop.uniqueItems !== undefined) field.uniqueItems = prop.uniqueItems
            if (prop.items?.type) {
                const validTypes = ['string', 'number', 'integer', 'boolean', 'object', 'array'] as const
                if (validTypes.includes(prop.items.type as typeof validTypes[number]))
                    field.itemType = prop.items.type as typeof validTypes[number]
            }
        }

        // Recursively parse nested properties for object types
        if (prop.type === 'object' && prop.properties) {
            field.properties = Object.entries(prop.properties).map(([nestedName, nestedProp]: [string, JsonSchemaProperty]) =>
                parseJsonSchemaProperty(nestedName, nestedProp, prop.required || [])
            )
        }

        return field
    },
    generateJsonSchemaFromFields = () => {
        const schema: JsonSchemaObject = {
            type: 'object',
            properties: {},
            required: []
        }

        // Ensure properties and required are defined
        if (!schema.properties) schema.properties = {}
        if (!schema.required) schema.required = []

        fields.value.forEach((field) => {
            const property = convertFieldToJsonSchemaProperty(field)
            schema.properties![field.name] = property

            if (field.required)
                schema.required!.push(field.name)
        })

        if (schema.required!.length === 0)
            delete schema.required

        return schema
    },
    // Convert individual field to JSON Schema property (recursive)
    convertFieldToJsonSchemaProperty = (field: JsonSchemaField): JsonSchemaProperty => {
        const property: JsonSchemaProperty = {
            type: field.type
        }

        if (field.description?.trim())
            property.description = field.description.trim()

        // Add type-specific constraints
        if (field.type === 'string') {
            if (field.minLength !== undefined) property.minLength = field.minLength
            if (field.maxLength !== undefined) property.maxLength = field.maxLength
            if (field.pattern?.trim()) property.pattern = field.pattern.trim()
            if (field.format?.trim()) property.format = field.format.trim()
            if (field.enumValues?.length) property.enum = field.enumValues
        }

        if (field.type === 'number' || field.type === 'integer') {
            if (field.minimum !== undefined) property.minimum = field.minimum
            if (field.maximum !== undefined) property.maximum = field.maximum
            if (field.exclusiveMinimum !== undefined) property.exclusiveMinimum = field.exclusiveMinimum
            if (field.exclusiveMaximum !== undefined) property.exclusiveMaximum = field.exclusiveMaximum
            if (field.multipleOf !== undefined) property.multipleOf = field.multipleOf
            if (field.enumValues?.length) property.enum = field.enumValues.map(Number)
        }

        if (field.type === 'array') {
            if (field.minItems !== undefined) property.minItems = field.minItems
            if (field.maxItems !== undefined) property.maxItems = field.maxItems
            if (field.uniqueItems !== undefined) property.uniqueItems = field.uniqueItems
            if (field.itemType)
                property.items = { type: field.itemType }
        }

        // Recursively handle nested properties for object types
        if (field.type === 'object' && field.properties?.length) {
            property.properties = {}
            const required: string[] = []

            field.properties.forEach((nestedField) => {
                property.properties![nestedField.name] = convertFieldToJsonSchemaProperty(nestedField)
                if (nestedField.required)
                    required.push(nestedField.name)
            })

            if (required.length > 0)
                property.required = required
        }

        return property
    },
    addField = () => {
        const newField: JsonSchemaField = {
            name: `field${fields.value.length + 1}`,
            type: 'string',
            required: false,
            isExpanded: true
        }

        fields.value.push(newField)
        generateAndEmitSchema()
    },
    removeField = (index: number) => {
        fields.value.splice(index, 1)
        generateAndEmitSchema()
    },
    updateField = (index: number, updatedField: JsonSchemaField) => {
        fields.value[index] = updatedField
        generateAndEmitSchema()
    },
    validateFields = async (): Promise<{ isValid: boolean, message?: string }> => {
        const invalidFields = fields.value.filter(field => !field.name.trim())
        return invalidFields.length > 0
            ? { isValid: false, message: 'Please provide names for all schema fields.' }
            : { isValid: true }
    },
    downloadSchema = () => {
        const schema = generateJsonSchemaFromFields(),
            jsonString = JSON.stringify(schema, null, 2),

            // Create and download the file
            blob = new Blob([jsonString], { type: 'application/json' }),
            url = URL.createObjectURL(blob),
            link = document.createElement('a')

        link.href = url
        link.download = 'schema.json'
        document.body.appendChild(link)
        link.click()

        // Clean up
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

// Initialize from modelValue (only once)
watchEffect(() => {
    if (props.modelValue && typeof props.modelValue === 'object' && fields.value.length === 0)
        parseJsonSchemaToFields(props.modelValue as JsonSchemaObject)
})

onMounted(() => {
    emit('validation-ready', validateFields)
})
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-end gap-2">
            <UButton
                color="secondary"
                variant="outline"
                icon="i-heroicons-arrow-down-tray"
                :disabled="fields.length === 0"
                @click="downloadSchema"
            >
                Download Schema
            </UButton>
            <UButton
                v-if="!disabled"
                color="primary"
                icon="i-heroicons-plus"
                :disabled="disabled"
                @click="addField"
            >
                Add Field
            </UButton>
        </div>

        <div
            v-if="fields.length === 0 && !disabled"
            class="text-center py-12 text-muted"
        >
            <p class="text-lg">
                No fields defined yet
            </p>
            <p class="text-sm">
                Click "Add Field" to start building your schema
            </p>
        </div>

        <div
            v-else-if="fields.length === 0 && disabled"
            class="text-center py-8 text-muted border border-dashed rounded-lg"
        >
            <p class="text-sm">
                No schema fields are defined
            </p>
        </div>

        <JsonFieldItem
            v-for="(field, index) in fields"
            :key="`field-${index}`"
            :field="field"
            :index="index"
            :disabled="disabled"
            @update="(updatedField) => updateField(index, updatedField)"
            @remove="() => removeField(index)"
        />

        <div class="text-xs text-muted">
            Fields: {{ fields.length }}
        </div>
    </div>
</template>
