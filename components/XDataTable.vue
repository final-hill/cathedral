<script lang="ts" setup>
import { NIL as emptyUuid } from 'uuid'

export type RowType = any

const props = defineProps<{
    datasource: RowType[] | null,
    filters: Record<string, { value: any, matchMode: string }>,
    emptyRecord: { id: string, name: string },
    btnCreateLabel?: string,
    onCreate: (data: RowType) => Promise<void>,
    onDelete: (id: string) => Promise<void>,
    onUpdate: (data: RowType) => Promise<void>,
    onRowExpand?: (event: { data: RowType }) => void,
    onRowCollapse?: (event: { data: RowType }) => void
}>()

const dataTable = ref<any>(),
    createDisabled = ref(false),
    editingRows = ref<RowType[]>([]),
    sortField = ref<string | undefined>('name'),
    confirm = useConfirm()

const onCreateEmpty = async () => {
    (props.datasource ?? []).unshift(Object.assign({}, props.emptyRecord))
    editingRows.value = [(props.datasource ?? [])[0]]
    createDisabled.value = true
    // remove the sortfield to avoid the new row from being sorted
    sortField.value = undefined

    // focus on the first input
    setTimeout(() => {
        const input = dataTable.value!.$el.querySelector('.p-datatable-tbody tr input')! as HTMLInputElement
        input.focus()
    }, 100)
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

const onCancel = ({ data, index }: { data: RowType, index: number }) => {
    if (data.id !== emptyUuid)
        return

    (props.datasource ?? []).splice(index, 1)
    createDisabled.value = false
    sortField.value = 'name'
}

const onRowExpand = (event: { data: RowType }) => {
    if (props.onRowExpand)
        props.onRowExpand(event)
}

const onRowCollapse = (event: { data: RowType }) => {
    if (props.onRowCollapse)
        props.onRowCollapse(event)
}

const onRowEditSave = async (event: { newData: RowType, originalEvent: Event }) => {
    const { newData, originalEvent } = event

    const row = (originalEvent.target! as HTMLElement).closest('tr')!,
        inputs = row.querySelectorAll('input'),
        dropDowns = row.querySelectorAll('.p-dropdown[required="true"]')

    if (![...inputs].every(o => o.reportValidity())) {
        editingRows.value = [newData]
        return
    }

    if (![...dropDowns].every(dd => {
        const value = dd.querySelector('.p-inputtext')!.textContent?.trim(),
            result = value !== '' && !value?.startsWith('Select')

        dd.classList.toggle('p-invalid', !result)

        return result
    })) {
        editingRows.value = [newData]
        return
    }

    if (newData.id === emptyUuid) {
        await props.onCreate(newData)
        createDisabled.value = false
    } else {
        await props.onUpdate(newData)
    }
}

const onRowEditInit = ({ originalEvent }: any) => {
    // focus on the first input when editing
    const row = originalEvent.target.closest('tr')
    setTimeout(() => {
        const input = row.querySelector('input')
        input.focus()
    }, 100)
}

const onSort = (event: any) => {
    if (editingRows.value.length > 0) {
        // cancel editing of the dummy row
        if (editingRows.value[0].id === emptyUuid)
            onCancel({ data: editingRows.value[0], index: 0 })

        editingRows.value = []
        createDisabled.value = false
    }
}
</script>

<template>
    <section>
        <ConfirmDialog></ConfirmDialog>
        <Toolbar>
            <template #start>
                <Button :label="props.btnCreateLabel ?? 'Create'" severity="info" @click="onCreateEmpty"
                    :disabled="createDisabled" />
            </template>
        </Toolbar>
        <DataTable ref="dataTable" :value="props.datasource as unknown as any[]" dataKey="id" filterDisplay="row"
            v-model:filters="filters as any" :globalFilterFields="Object.keys(filters)" editMode="row"
            @row-edit-init="onRowEditInit" v-model:editingRows="editingRows" @row-edit-save="onRowEditSave"
            @row-edit-cancel="onCancel" @row-expand="onRowExpand" @row-collapse="onRowCollapse" @sort="onSort"
            :sortField="sortField" :sortOrder="1">
            <slot></slot>
            <Column frozen align-frozen="right">
                <template #body="{ data, editorInitCallback }">
                    <Button icon="pi pi-pencil" text rounded @click="editorInitCallback" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="onDelete(data)" />
                </template>
                <template #editor="{ editorSaveCallback, editorCancelCallback }">
                    <Button icon="pi pi-check" text rounded @click="editorSaveCallback" />
                    <Button icon="pi pi-times" text rounded severity="danger" @click="editorCancelCallback" />
                </template>
            </Column>
            <template #empty>No data found</template>
            <template #loading>Loading data...</template>
        </DataTable>
    </section>
</template>

<style scoped>
:deep(.p-cell-editing) {
    background-color: var(--highlight-bg);
}
</style>