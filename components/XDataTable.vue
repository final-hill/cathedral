<script lang="tsx" generic="V extends ViewSchema, E extends EditSchema, C extends CreateSchema" setup>
import { getSchemaFields } from '#shared/utils';
import type { TableColumn } from '@nuxt/ui';
import { UButton, UCheckbox, UModal } from '#components';
import { z } from 'zod';
import XForm from './XForm.vue';

export type ZodShape = z.ZodString | z.ZodNumber | z.ZodDate | z.ZodBoolean | z.ZodObject<{ id: z.ZodString, name: z.ZodString }>
    | z.ZodReadonly<ZodShape> | z.ZodOptional<ZodShape> | z.ZodNativeEnum<any>
export type ViewSchema = z.ZodObject<{ [key: string]: ZodShape }>
export type EditSchema = z.ZodObject<{ id: z.ZodReadonly<z.ZodString>, [key: string]: ZodShape }>
export type CreateSchema = z.ZodObject<{ [key: string]: ZodShape }>

const props = defineProps<{
    data: ({ id: string } & z.infer<V>)[] | null,
    viewSchema: V,
    editSchema: E,
    createSchema: C,
    loading: boolean,
    onCreate: (data: z.infer<C>) => Promise<void>,
    onDelete: (id: string) => Promise<void>,
    onUpdate: (data: z.infer<E>) => Promise<void>
}>()

const createDisabled = ref(false),
    deleteModalOpenState = ref(false),
    deleteModalItem = ref<z.infer<E>>(),
    editModalOpenState = ref(false),
    editModalItem = ref<z.infer<E>>(),
    createModalOpenState = ref(false),
    createModalItem = ref<z.infer<C>>(),
    globalFilter = ref<any>('')

const viewDataColumns: TableColumn<z.infer<V>>[] = getSchemaFields(props.viewSchema)
    .map(({ key, label, innerType }) => ({
        key,
        header: label,
        sortable: !(innerType instanceof z.ZodObject),
        cell: ({ row }) => {
            const value = row.original[key]

            switch (true) {
                case innerType instanceof z.ZodString:
                case innerType instanceof z.ZodNumber:
                case innerType instanceof z.ZodNativeEnum:
                case innerType instanceof z.ZodEnum:
                    return value
                case innerType instanceof z.ZodDate:
                    return <time datetime={value as string}>{new Date(value as string).toLocaleString()}</time>
                case innerType instanceof z.ZodBoolean:
                    return <UCheckbox modelValue={Boolean(value)} disabled />
                case innerType instanceof z.ZodObject:
                    const reqObj = value as { id: string, name: string }
                    return reqObj.name
                default:
                    // TODO: Readonly and Optional
                    return value
            }
        }
    }))

const actionColumn: TableColumn<z.infer<V>> = {
    header: 'Actions',
    cell: ({ row }) => {
        const item = row.original

        return <div class='flex gap-2'>
            <UButton icon="i-lucide-pen" color="primary" onClick={() => openEditModal(item.id as string)} />
            <UButton icon="i-lucide-trash-2" color="error" onClick={() => openDeleteModal(item.id as string)} />
        </div>
    }
}

const columns = [...viewDataColumns, actionColumn]

const openEditModal = (itemId: string) => {
    const item = props.data!.find((row: z.infer<V>) => row.id === itemId)
    editModalItem.value = Object.create(item!)
    editModalOpenState.value = true
}

const openDeleteModal = (itemId: string) => {
    deleteModalItem.value = props.data!.find((row: z.infer<V>) => row.id === itemId)
    deleteModalOpenState.value = true
}

const openCreateModal = () => {
    createModalItem.value = Object.create(null)
    createModalOpenState.value = true
}

const onCreateModalSubmit = async (_: any) => {
    props.onCreate(createModalItem.value!)
    createModalItem.value = Object.create(null)
    createModalOpenState.value = false
}

const onCreateModalReset = () => {
    createModalItem.value = Object.create(null)
    createModalOpenState.value = false
}

const onEditModalSubmit = async (_: any) => {
    const index = props.data!.findIndex((row: z.infer<V>) => row.id === (editModalItem.value! as { id: string }).id)
    if (index !== -1)
        props.data![index] = { ...props.data![index], ...editModalItem.value }
    await props.onUpdate(editModalItem.value!)
    editModalItem.value = Object.create(null)
    editModalOpenState.value = false
}

const onEditModalReset = () => {
    editModalItem.value = Object.create(null)
    editModalOpenState.value = false
}

const onDeleteModalSubmit = async (_: any) => {
    props.onDelete((deleteModalItem.value! as { id: string }).id)
    deleteModalItem.value = undefined
    deleteModalOpenState.value = false
}
</script>

<template>
    <section>
        <div class="flex justify-between items-center mb-4">
            <UButton label="Create" color="primary" @click="openCreateModal" :disabled="createDisabled" size="xl" />
            <UInput type="text" v-model="globalFilter" placeholder="Filter..." />
        </div>
        <UTable :data="props.data ?? undefined" v-model:global-filter="globalFilter" :columns="columns"
            :empty-state="{ icon: 'i-lucide-database', label: 'No items.' }" />
    </section>

    <UModal v-model:open="createModalOpenState" title='Create Item'>
        <template #body>
            <XForm :state="createModalItem!" :schema="props.createSchema" :onSubmit="onCreateModalSubmit"
                :onCancel="onCreateModalReset" />
        </template>
    </UModal>

    <UModal v-model:open="deleteModalOpenState" title='Delete Item' :dismissable="false">
        <template #body>
            Are you sure you want to delete {{ deleteModalItem?.name }}?
        </template>
        <template #footer>
            <div class="flex gap-2">
                <UButton label="Cancel" color="neutral" @click="deleteModalOpenState = false" />
                <UButton label="Delete" color="error" @click="onDeleteModalSubmit" />
            </div>
        </template>
    </UModal>

    <UModal v-model:open="editModalOpenState" title="Edit Item">
        <template #body>
            <XForm :state="editModalItem!" :schema="props.editSchema" :onSubmit="onEditModalSubmit"
                :onCancel="onEditModalReset" />
        </template>
    </UModal>
</template>