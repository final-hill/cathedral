<script lang="ts" generic="RowType extends {id: string, name: string}" setup>
import type Dialog from 'primevue/dialog'
import type DataTable from 'primevue/datatable'
import { FilterMatchMode } from 'primevue/api';
import camelCaseToTitle from '~/utils/camelCaseToTitle';

export type ViewFieldType = 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'hidden' | 'object'

export type FormFieldType = 'text' | 'textarea' | { type: 'number', min: number, max: number } | 'date' | 'boolean' | 'hidden' | string[]
    | { type: 'requirement', options: { id: string, name: string }[] }

const props = defineProps<{
    datasource: RowType[] | null,
    viewModel: { [K in keyof RowType]?: ViewFieldType },
    createModel: { [K in keyof RowType]?: FormFieldType },
    editModel: { [K in keyof RowType]?: FormFieldType },
    loading: boolean,
    onCreate: (data: RowType) => Promise<void>,
    onDelete: (id: string) => Promise<void>,
    onUpdate: (data: RowType) => Promise<void>
}>()

const slots = defineSlots<{
    rows: { data: RowType }[],
    createDialog: { data: RowType },
    editDialog: { data: RowType }
}>()

const dataTable = ref<DataTable>(),
    createDisabled = ref(false),
    sortField = ref<string | undefined>('name'),
    confirm = useConfirm(),
    createDialog = ref<Dialog>(),
    createDialogVisible = ref(false),
    createDialogItem = ref<RowType>(Object.create(null)),
    editDialog = ref<Dialog>(),
    editDialogVisible = ref(false),
    editDialogItem = ref<RowType>(Object.create(null))

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
    createDialogItem.value = Object.create(null)
}

const onCreateDialogCancel = () => {
    createDialogItem.value = Object.create(null)
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
            <Column
                v-for="key of Object.keys(props.viewModel).filter(k => props.viewModel[k as keyof RowType] !== 'hidden')"
                :key="key" :field="key" :header="camelCaseToTitle(key)" sortable>
                <template #body="{ data, field }">
                    <span v-if="props.viewModel[field as keyof RowType] === 'text'">{{ data[field] }}</span>
                    <span v-else-if="
                        typeof props.viewModel[field as keyof RowType] === 'object' &&
                        (props.viewModel[field as keyof RowType] as any).type === 'number'
                    ">{{ data[field] }}</span>
                    <time v-else-if="props.viewModel[field as keyof RowType] === 'date'" :datetime="data[field]">
                        {{ new Date(data[field]).toLocaleDateString() }}
                    </time>
                    <Checkbox v-else-if="props.viewModel[field as keyof RowType] === 'boolean'" v-model="data[field]"
                        disabled />
                    <span v-else-if="props.viewModel[field as keyof RowType] === 'object'">
                        {{ data[field]?.name ?? JSON.stringify(data[field]) }}
                    </span>
                    <span v-else-if="props.viewModel[field as keyof RowType] === 'textarea'">{{ data[field] }}</span>
                    <span v-else>{{ data[field] }}</span>
                </template>
            </Column>
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
            <div class="field grid"
                v-for="key of Object.keys(props.createModel).filter(k => props.createModel[k as keyof RowType] !== 'hidden')"
                :key="key" :field="key">
                <label :for="key" class="col-4">{{ camelCaseToTitle(key) }}</label>

                <InputText v-if="props.createModel[key as keyof RowType] === 'text'" :name="key"
                    v-model.trim="createDialogItem[key]" class="col-8" />
                <InputNumber v-else-if="
                    typeof props.createModel[key as keyof RowType] === 'object' &&
                    (props.createModel[key as keyof RowType] as any).type === 'number'
                " :name="key" v-model.trim="createDialogItem[key]"
                    :min="(props.createModel[key as keyof RowType] as any).min"
                    :max="(props.createModel[key as keyof RowType] as any).max" class="col-8"
                    :pt="{ input: { root: { name: key, required: true } } }" />
                <Calendar v-else-if="props.createModel[key as keyof RowType] === 'date'" v-model="createDialogItem[key]"
                    :name="key" :showTime="true" hourFormat="24" />
                <Checkbox v-else-if="props.createModel[key as keyof RowType] === 'boolean'" :name="key"
                    v-model="createDialogItem[key]" class="col-8" />
                <select v-else-if="Array.isArray(props.createModel[key as keyof RowType])" :name="key"
                    class="p-inputtext p-component col-8" v-model="createDialogItem[key]">
                    <option v-for="option of props.createModel[key as keyof RowType]" :key="option as string"
                        :value="option">
                        {{ option }}
                    </option>
                </select>
                <select v-else-if="
                    typeof props.createModel[key as keyof RowType] === 'object' &&
                    (props.createModel[key as keyof RowType] as any).type === 'requirement'
                " :name="key" class="p-inputtext p-component col-8"
                    v-model.trim="(createDialogItem[key] ?? { id: '' }).id">
                    <option value="" disabled>Select a {{ camelCaseToTitle(key) }}</option>
                    <option v-for="option of (props.createModel[key as keyof RowType] as any).options" :key="option?.id"
                        :value="option?.id">
                        {{ option.name }}
                    </option>
                </select>

                <Textarea v-else-if="props.createModel[key as keyof RowType] === 'textarea'" :name="key"
                    v-model.trim="createDialogItem[key]" class="col-8" />
                <span v-else>{{ createDialogItem[key] }}</span>
            </div>
        </form>
        <template #footer>
            <Button label="Save" form="createDialogForm" type="submit" icon="pi pi-check" class="p-button-text" />
            <Button label="Cancel" type="reset" form="createDialogForm" icon="pi pi-times" class="p-button-text" />
        </template>
    </Dialog>

    <Dialog ref="editDialog" v-model:visible="editDialogVisible" :modal="true" class="p-fluid">
        <template #header>Edit Item</template>
        <form id="editDialogForm" autocomplete="off" @submit.prevent="onEditDialogSave" @reset="onEditDialogCancel">
            <div class="field grid" v-for="key of Object.keys(props.editModel)" :key="key" :field="key">
                <label v-if="props.editModel[key as keyof RowType] !== 'hidden'" :for="key" class="col-4">{{
                    camelCaseToTitle(key) }}</label>

                <InputText v-if="props.editModel[key as keyof RowType] === 'text'" :name="key"
                    v-model.trim="editDialogItem[key]" class="col-8" />
                <input v-else-if="props.editModel[key as keyof RowType] === 'hidden'" type="hidden" :name="key"
                    v-model.trim="editDialogItem[key]" />
                <InputNumber v-else-if="
                    typeof props.editModel[key as keyof RowType] === 'object' &&
                    (props.editModel[key as keyof RowType] as any).type === 'number'
                " :name="key" v-model.trim="editDialogItem[key]"
                    :min="(props.editModel[key as keyof RowType] as any).min"
                    :max="(props.editModel[key as keyof RowType] as any).max" class="col-8"
                    :pt="{ input: { root: { name: key, required: true } } }" />
                <Calendar v-else-if="props.editModel[key as keyof RowType] === 'date'" v-model="editDialogItem[key]"
                    :name="key" :showTime="true" hourFormat="24" />
                <Checkbox v-else-if="props.editModel[key as keyof RowType] === 'boolean'" :name="key"
                    v-model="editDialogItem[key]" class="col-8" />
                <select v-else-if="Array.isArray(props.editModel[key as keyof RowType])" :name="key"
                    class="p-inputtext p-component col-8" v-model="editDialogItem[key]">
                    <option v-for="option of props.editModel[key as keyof RowType]" :key="option as string"
                        :value="option">
                        {{ option }}
                    </option>
                </select>
                <select v-else-if="
                    typeof props.editModel[key as keyof RowType] === 'object' &&
                    (props.editModel[key as keyof RowType] as any).type === 'requirement'
                " :name="key" class="p-inputtext p-component col-8"
                    v-model.trim="(editDialogItem[key] ?? { id: '' }).id">
                    <option value="" disabled>Select a {{ camelCaseToTitle(key) }}</option>
                    <option v-for="option of (props.editModel[key as keyof RowType] as any).options" :key="option.id"
                        :value="option.id">
                        {{ option.name }}
                    </option>
                </select>
                <Textarea v-else-if="props.editModel[key as keyof RowType] === 'textarea'" :name="key"
                    v-model.trim="editDialogItem[key]" class="col-8" />
                <span v-else>{{ editDialogItem[key] }}</span>
            </div>
        </form>
        <template #footer>
            <Button label="Save" type="submit" form="editDialogForm" icon="pi pi-check" class="p-button-text" />
            <Button label="Cancel" type="reset" form="editDialogForm" icon="pi pi-times" class="p-button-text" />
        </template>
    </Dialog>
</template>