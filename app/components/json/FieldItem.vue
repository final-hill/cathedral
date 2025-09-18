<template>
    <div class="border-default rounded-lg p-4 space-y-4 bg-muted">
        <div class="flex items-start gap-6">
            <UFormField
                label="Field Name"
                class="w-40"
            >
                <strong
                    v-if="disabled"
                    class="text-highlighted"
                >
                    {{ field.name }}
                </strong>
                <UInput
                    v-if="!disabled"
                    :model-value="field.name"
                    placeholder="Enter field name"
                    @update:model-value="updateField('name', $event)"
                />
            </UFormField>
            <UFormField
                label="Type"
                class="w-28"
            >
                <UInputMenu
                    v-if="!disabled"
                    :model-value="field.type"
                    :items="fieldTypeOptions"
                    value-key="value"
                    label-key="label"
                    @update:model-value="(value) => handleTypeChange(value as JsonSchemaField['type'])"
                />
                <strong
                    v-else
                    class="text-highlighted"
                >
                    {{ field.type }}
                </strong>
            </UFormField>
            <UFormField
                label="Required"
                class="shrink-0 flex flex-col"
            >
                <USwitch
                    v-if="!disabled"
                    class="mt-2"
                    :model-value="field.required"
                    @update:model-value="updateField('required', $event)"
                />
                <strong
                    v-else
                    class="text-highlighted"
                >
                    {{ field.required ? 'Yes' : 'No' }}
                </strong>
            </UFormField>
            <UFormField label="Description">
                <UInput
                    v-if="!disabled"
                    :model-value="field.description"
                    placeholder="Enter field description"
                    @update:model-value="updateField('description', $event)"
                />
                <strong
                    v-else
                    class="text-highlighted"
                >
                    {{ field.description || '- No description -' }}
                </strong>
            </UFormField>

            <UFormField
                v-if="!disabled"
                label="Action"
            >
                <UButton
                    color="error"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    :disabled="disabled"
                    @click="$emit('remove')"
                />
            </UFormField>
        </div>
        <UCollapsible
            :model-value="field.isExpanded"
            @update:model-value="updateField('isExpanded', $event)"
        >
            <template #default="{ open }">
                <UButton
                    variant="ghost"
                    size="sm"
                    :icon="open ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                >
                    Type-specific Settings
                </UButton>
            </template>

            <template #content>
                <div class="pl-4 pt-4 space-y-4 border-l border-default">
                    <!-- String constraints -->
                    <template v-if="field.type === 'string'">
                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Min Length">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.minLength"
                                    :min="0"
                                    placeholder="No minimum"
                                    @update:model-value="updateField('minLength', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.minLength !== undefined ? field.minLength : 'No minimum' }}
                                </strong>
                            </UFormField>
                            <UFormField label="Max Length">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.maxLength"
                                    :min="0"
                                    placeholder="No maximum"
                                    @update:model-value="updateField('maxLength', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.maxLength !== undefined ? field.maxLength : 'No maximum' }}
                                </strong>
                            </UFormField>
                        </div>
                        <UFormField label="Pattern (RegEx)">
                            <UInput
                                v-if="!disabled"
                                :model-value="field.pattern"
                                placeholder="Regular expression pattern"
                                @update:model-value="updateField('pattern', $event)"
                            />
                            <strong
                                v-else
                                class="text-highlighted"
                            >
                                {{ field.pattern || '- No pattern -' }}
                            </strong>
                        </UFormField>
                        <UFormField label="Format">
                            <UInputMenu
                                v-if="!disabled"
                                :model-value="field.format"
                                :items="stringFormatOptions"
                                value-key="value"
                                label-key="label"
                                placeholder="Select format"
                                nullable
                                @update:model-value="(value) => updateField('format', value as JsonSchemaField['format'])"
                            />
                            <strong
                                v-else
                                class="text-highlighted"
                            >
                                {{ field.format || '- No format -' }}
                            </strong>
                        </UFormField>
                    </template>
                    <template v-else-if="field.type === 'number' || field.type === 'integer'">
                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Minimum">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.minimum"
                                    placeholder="No minimum"
                                    @update:model-value="updateField('minimum', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.minimum !== undefined ? field.minimum : 'No minimum' }}
                                </strong>
                            </UFormField>
                            <UFormField label="Maximum">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.maximum"
                                    placeholder="No maximum"
                                    @update:model-value="updateField('maximum', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.maximum !== undefined ? field.maximum : 'No maximum' }}
                                </strong>
                            </UFormField>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Exclusive Minimum">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.exclusiveMinimum"
                                    placeholder="No exclusive min"
                                    @update:model-value="updateField('exclusiveMinimum', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.exclusiveMinimum !== undefined ? field.exclusiveMinimum : 'No exclusive min' }}
                                </strong>
                            </UFormField>
                            <UFormField label="Exclusive Maximum">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.exclusiveMaximum"
                                    placeholder="No exclusive max"
                                    @update:model-value="updateField('exclusiveMaximum', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.exclusiveMaximum !== undefined ? field.exclusiveMaximum : 'No exclusive max' }}
                                </strong>
                            </UFormField>
                        </div>
                        <UFormField label="Multiple Of">
                            <UInputNumber
                                v-if="!disabled"
                                :model-value="field.multipleOf"
                                :min="0"
                                :step="0.001"
                                placeholder="No multiple constraint"
                                @update:model-value="updateField('multipleOf', $event)"
                            />
                            <strong
                                v-else
                                class="text-highlighted"
                            >
                                {{ field.multipleOf !== undefined ? field.multipleOf : 'No multiple constraint' }}
                            </strong>
                        </UFormField>
                    </template>
                    <template v-if="field.type === 'object'">
                        <div class="border-t pt-4">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-medium">
                                    Nested Properties
                                </h4>
                                <UButton
                                    v-if="!disabled"
                                    icon="i-heroicons-plus"
                                    variant="outline"
                                    size="sm"
                                    @click="addNestedField"
                                >
                                    Add Nested Field
                                </UButton>
                            </div>

                            <!-- Recursive field list for nested properties -->
                            <div
                                v-if="field.properties?.length"
                                class="space-y-4"
                            >
                                <JsonFieldItem
                                    v-for="(nestedField, nestedIndex) in field.properties"
                                    :key="`nested-${nestedIndex}`"
                                    :field="nestedField"
                                    :index="nestedIndex"
                                    :disabled="disabled"
                                    @update="(updatedField) => updateNestedField(nestedIndex, updatedField)"
                                    @remove="() => removeNestedField(nestedIndex)"
                                />
                            </div>

                            <div
                                v-else
                                class="text-sm text-muted italic"
                            >
                                No nested properties defined
                            </div>
                        </div>
                    </template>
                    <template v-if="field.type === 'array'">
                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Min Items">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.minItems"
                                    :min="0"
                                    placeholder="No minimum"
                                    @update:model-value="updateField('minItems', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.minItems !== undefined ? field.minItems : 'No minimum' }}
                                </strong>
                            </UFormField>
                            <UFormField label="Max Items">
                                <UInputNumber
                                    v-if="!disabled"
                                    :model-value="field.maxItems"
                                    :min="0"
                                    placeholder="No maximum"
                                    @update:model-value="updateField('maxItems', $event)"
                                />
                                <strong
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.maxItems !== undefined ? field.maxItems : 'No maximum' }}
                                </strong>
                            </UFormField>
                        </div>
                        <UFormField label="Unique Items">
                            <div class="flex items-center gap-2">
                                <USwitch
                                    v-if="!disabled"
                                    :model-value="field.uniqueItems || false"
                                    @update:model-value="updateField('uniqueItems', $event)"
                                />
                                <span
                                    v-else
                                    class="text-highlighted"
                                >
                                    {{ field.uniqueItems !== undefined ? field.uniqueItems : 'No maximum' }}
                                </span>
                                <span class="text-sm text-muted">Require all items to be unique</span>
                            </div>
                        </UFormField>
                        <UFormField label="Item Type">
                            <UInputMenu
                                v-if="!disabled"
                                :model-value="field.itemType || 'string'"
                                :items="fieldTypeOptions"
                                value-key="value"
                                label-key="label"
                                @update:model-value="(value) => updateField('itemType', value as JsonSchemaField['itemType'])"
                            />
                            <strong
                                v-else
                                class="text-highlighted"
                            >
                                {{ field.itemType || 'string' }}
                            </strong>
                        </UFormField>
                    </template>
                    <template v-if="field.type === 'boolean'">
                        <div class="text-sm text-muted italic">
                            Boolean fields don't require additional constraints
                        </div>
                    </template>
                    <template v-if="field.type === 'string' || field.type === 'number' || field.type === 'integer'">
                        <div class="border-t pt-4">
                            <UFormField
                                label="Allowed Values (Enum)"
                                help="Enter values and press Enter to add them as allowed options"
                            >
                                <UInputTags
                                    v-if="!disabled"
                                    :model-value="field.enumValues || []"
                                    placeholder="Enter enum value and press Enter"
                                    @update:model-value="(values) => updateField('enumValues', values.length > 0 ? values : undefined)"
                                />
                                <div
                                    v-else
                                    class="text-sm text-highlighted"
                                >
                                    <template v-if="field.enumValues && field.enumValues.length">
                                        {{ field.enumValues.join(', ') }}
                                    </template>
                                    <template v-else>
                                        - No enum values defined -
                                    </template>
                                </div>
                            </UFormField>
                        </div>
                    </template>
                </div>
            </template>
        </UCollapsible>
    </div>
</template>

<script setup lang="ts">
import type { JsonSchemaField } from './SchemaEditor.vue'

const props = defineProps<{
    field: JsonSchemaField
    index: number
    disabled?: boolean
}>(),
    emit = defineEmits<{
        (event: 'update', field: JsonSchemaField): void
        (event: 'remove'): void
    }>(),
    fieldTypeOptions = [
        { label: 'String', value: 'string' },
        { label: 'Number', value: 'number' },
        { label: 'Integer', value: 'integer' },
        { label: 'Boolean', value: 'boolean' },
        { label: 'Object', value: 'object' },
        { label: 'Array', value: 'array' }
    ],
    stringFormatOptions = [
        { label: 'Email', value: 'email' },
        { label: 'URI', value: 'uri' },
        { label: 'Date', value: 'date' },
        { label: 'Date-Time', value: 'date-time' },
        { label: 'UUID', value: 'uuid' },
        { label: 'Hostname', value: 'hostname' },
        { label: 'IPv4', value: 'ipv4' },
        { label: 'IPv6', value: 'ipv6' }
    ],
    updateField = (key: keyof JsonSchemaField, value: JsonSchemaField[keyof JsonSchemaField]) => {
        const updatedField = { ...props.field, [key]: value }
        emit('update', updatedField)
    },
    handleTypeChange = (newType: JsonSchemaField['type']) => {
        const updatedField = { ...props.field, type: newType }

        if (newType === 'object' && !updatedField.properties)
            updatedField.properties = []

        if (newType !== 'object' && updatedField.properties)
            delete updatedField.properties

        if (newType === 'array' && !updatedField.itemType)
            updatedField.itemType = 'string'

        emit('update', updatedField)
    },
    addNestedField = () => {
        if (!props.field.properties) return

        const newNestedField: JsonSchemaField = {
                name: `nestedField${props.field.properties.length + 1}`,
                type: 'string',
                required: false,
                isExpanded: true
            },
            updatedField = {
                ...props.field,
                properties: [...props.field.properties, newNestedField]
            }

        emit('update', updatedField)
    },
    updateNestedField = (index: number, updatedNestedField: JsonSchemaField) => {
        if (!props.field.properties) return

        const newProperties = [...props.field.properties]
        newProperties[index] = updatedNestedField

        const updatedField = {
            ...props.field,
            properties: newProperties
        }

        emit('update', updatedField)
    },
    removeNestedField = (index: number) => {
        if (!props.field.properties) return

        const newProperties = [...props.field.properties]
        newProperties.splice(index, 1)

        const updatedField = {
            ...props.field,
            properties: newProperties
        }

        emit('update', updatedField)
    }
</script>
