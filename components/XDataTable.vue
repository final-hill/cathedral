<script lang="ts" generic="RowType extends {id: string, name: string}" setup>
import type Dialog from 'primevue/dialog'
import type DataTable from 'primevue/datatable'
import { FilterMatchMode } from 'primevue/api';

export type EmptyRecord = { id: string, name: string }

const props = defineProps<{
    datasource: RowType[] | null,
    emptyRecord: EmptyRecord,
    loading: boolean,
    onCreate: (data: RowType) => Promise<void>,
    onDelete: (id: string) => Promise<void>,
    onUpdate: (data: RowType) => Promise<void>
}>()

const slots = defineSlots<{
    rows: { data: RowType }[],
    createDialog: { data: EmptyRecord },
    editDialog: { data: RowType }
}>()

const dataTable = ref<DataTable>(),
    createDisabled = ref(false),
    sortField = ref<string | undefined>('name'),
    confirm = useConfirm(),
    createDialog = ref<Dialog>(),
    createDialogVisible = ref(false),
    createDialogItem = ref<EmptyRecord>({ ...props.emptyRecord }),
    editDialog = ref<Dialog>(),
    editDialogVisible = ref(false),
    editDialogItem = ref<RowType>()

const filters = ref<Record<string, { value: any, matchMode: string }>>({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const openEditDialog = (item: RowType) => {
    editDialogVisible.value = true
    // focus on the first element under the #editDialogForm with a name attribute that isn't 'hidden'
    const firstInput = document.querySelector('#editDialogForm [name]:not([type="hidden"])') as HTMLInputElement
    if (firstInput) firstInput.focus()
    editDialogItem.value = { ...item }
}

const onDelete = (item: RowType) => new Promise<void>((resolve, _reject) => {
    confirm.require({
        message: `Are you sure you want to delete ${item.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await props.onDelete(item.id)
            resolve()
        },
        reject: () => { }
    })
})

const onCreateDialogSave = async (e: Event) => {
    const form = e.target as HTMLFormElement
    if (!form.reportValidity())
        return
    const data = [...new FormData(form).entries()].reduce((acc, [key, value]) => {
        // If the data entry was from a form input element with inputmode="numeric", convert it to a number
        const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement
        Object.assign(acc, { [key]: input.inputMode === 'numeric' ? parseFloat(value as string) : value })
        return acc
    }, {} as RowType)

    await props.onCreate(data)
    createDialogVisible.value = false
    createDialogItem.value = { ...props.emptyRecord }
}

const onCreateDialogCancel = () => {
    createDialogItem.value = { ...props.emptyRecord }
    createDialogVisible.value = false
}

const openCreateDialog = () => {
    createDialogVisible.value = true
    // focus on the first element under the #createDialogForm with a name attribute that isn't 'hidden'
    const firstInput = document.querySelector('#createDialogForm [name]:not([type="hidden"])') as HTMLInputElement
    if (firstInput) firstInput.focus()
}

const onEditDialogSave = async (e: Event) => {
    const form = e.target as HTMLFormElement
    if (!form.reportValidity())
        return
    const data = [...new FormData(form).entries()].reduce((acc, [key, value]) => {
        // If the data entry was from a form input element with inputmode="numeric", convert it to a number
        const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement
        Object.assign(acc, { [key]: input.inputMode === 'numeric' ? parseFloat(value as string) : value })
        return acc
    }, {} as RowType)

    await props.onUpdate(data)
    editDialogVisible.value = false
    editDialogItem.value = undefined
}

const onEditDialogCancel = () => {
    editDialogItem.value = undefined
    editDialogVisible.value = false
}
</script>

<template>
    <section>
        <ConfirmDialog></ConfirmDialog>
        <Toolbar>
            <template #start>
                <Button label="'Create" severity="info" @click="openCreateDialog" :disabled="createDisabled" />
            </template>
            <template #end>
                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </template>
        </Toolbar>
        <DataTable ref="dataTable" :value="props.datasource as unknown as any[]" dataKey="id" v-model:filters="filters"
            :globalFilterFields="Object.keys(props.datasource?.[0] ?? {})" :sortField="sortField" :sortOrder="1"
            :loading="props.loading">
            <slot name="rows"></slot>
            <Column frozen align-frozen="right">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" text rounded @click="openEditDialog(data)" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="onDelete(data)" />
                </template>
            </Column>
            <template #empty>No data found</template>
            <template #loading>Loading data...</template>
        </DataTable>
    </section>

    <Dialog ref="createDialog" v-model:visible="createDialogVisible" :modal="true" class="p-fluid">
        <template #header>Create Item</template>
        <form id="createDialogForm" autocomplete="off" @submit.prevent="onCreateDialogSave"
            @reset="onCreateDialogCancel">
            <slot name="createDialog" v-bind="{ data: createDialogItem }"></slot>
        </form>
        <template #footer>
            <Button label="Save" form="createDialogForm" type="submit" icon="pi pi-check" class="p-button-text" />
            <Button label="Cancel" type="reset" form="createDialogForm" icon="pi pi-times" class="p-button-text" />
        </template>
    </Dialog>

    <Dialog ref="editDialog" v-model:visible="editDialogVisible" :modal="true" class="p-fluid">
        <template #header>Edit Item</template>
        <form id="editDialogForm" autocomplete="off" @submit.prevent="onEditDialogSave" @reset="onEditDialogCancel">
            <slot name="editDialog" v-bind="{ data: editDialogItem }"></slot>
        </form>
        <template #footer>
            <Button label="Save" type="submit" form="editDialogForm" icon="pi pi-check" class="p-button-text" />
            <Button label="Cancel" type="reset" form="editDialogForm" icon="pi pi-times" class="p-button-text" />
        </template>
    </Dialog>
</template>