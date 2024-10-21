<script lang="ts" generic="RowType extends {id: string, name: string}" setup>
import type Dialog from 'primevue/dialog'
import type DataTable from 'primevue/datatable'
import { FilterMatchMode } from 'primevue/api';
import camelCaseToTitle from '~/utils/camelCaseToTitle.js';
import { AuditLog } from '~/server/domain/application/index.js';

export type ViewFieldType = 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'hidden' | 'object'

export type FormFieldType = 'text' | 'textarea' | { type: 'number', min: number, max: number } | 'date' | 'boolean' | 'hidden' | string[]
    | { type: 'requirement', options: { id: string, name: string }[] }

const props = defineProps<{
    datasource: RowType[] | null,
    entityName: string,
    showRecycleBin: boolean,
    viewModel: { [K in keyof RowType]?: ViewFieldType },
    createModel: { [K in keyof RowType]?: FormFieldType },
    editModel: { [K in keyof RowType]?: FormFieldType },
    loading: boolean,
    organizationSlug: string,
    onCreate: (data: RowType) => Promise<void>,
    onDelete: (id: string) => Promise<void>,
    onUpdate: (data: RowType) => Promise<void>
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
    editDialogItem = ref<RowType>(Object.create(null)),
    historyDialog = ref<Dialog>(),
    historyDialogVisible = ref(false),
    historyItems = ref<{ date: string, entity: Record<string, any> }[]>([]),
    selectedHistoryItem = ref<{ date: string, entity: Record<string, any> }>({ date: '', entity: {} }),
    historyDialogLoading = ref(false),
    recycleDialog = ref<Dialog>(),
    recycleDialogVisible = ref(false),
    recycleDialogLoading = ref(false),
    recycleItems = ref<{ date: string, entity: Record<string, any> }[]>([]),
    recycleBin = ref<DataTable>()

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

const openRecycleDialog = async () => {
    recycleDialogLoading.value = true
    recycleDialogVisible.value = true
    const recycleBinItems = (await $fetch<AuditLog[]>(`/api/audit-log/deleted`, {
        method: 'GET',
        query: {
            entityName: props.entityName,
            organizationSlug: props.organizationSlug
        }
    })).map(log => ({
        date: new Date(log.createdAt).toLocaleString(),
        entity: JSON.parse(log.entity)
    }))

    recycleItems.value = recycleBinItems
    recycleDialogLoading.value = false
}

const openHistoryDialog = async (item: RowType) => {
    historyDialogLoading.value = true
    historyDialogVisible.value = true
    const auditLog = (await $fetch<AuditLog[]>(`/api/audit-log`, {
        method: 'GET',
        query: {
            entityId: item.id,
            organizationSlug: props.organizationSlug
        }
    })).map(log => ({
        date: new Date(log.createdAt).toLocaleString(),
        entity: JSON.parse(log.entity)
    }))

    historyItems.value = [
        { date: 'Current', entity: item },
        ...auditLog
    ]

    selectedHistoryItem.value = historyItems.value[0]
    historyDialogLoading.value = false
}

const onHistoryChange = (e: Event) => {
    const select = e.target as HTMLSelectElement
    selectedHistoryItem.value = historyItems.value[select.selectedIndex]
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
                <Button label="Create" severity="info" class="mr-2" @click="openCreateDialog"
                    :disabled="createDisabled" />
                <Button v-if="props.showRecycleBin" label="Recycle Bin" severity="help" @click="openRecycleDialog" />
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
                    <Button icon="pi pi-pencil" text rounded @click="openEditDialog(data)" title="Edit" />
                    <Button icon="pi pi-clock" text rounded @click="openHistoryDialog(data)" title="History" />
                    <Button icon="pi pi-trash" text rounded severity="danger" @click="onDelete(data)" title="Delete" />
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

    <Dialog ref="recycleDialog" v-model:visible="recycleDialogVisible" :modal="true" class="p-fluid">
        <template #header>Recycle Bin</template>
        <section>
            <DataTable ref="recycleBin" :value="recycleItems" dataKey="date" :loading="recycleDialogLoading">
                <Column field="date" header="Date" sortable />
                <Column v-for="key of Object.keys(recycleItems?.[0]?.entity ?? {})" :key="key" :field="key"
                    :header="camelCaseToTitle(key)">
                    <template #body="{ data, field }">
                        <span v-if="data.entity[field] instanceof Date">{{ data.entity[field].toLocaleString() }}</span>
                        <span v-else-if="typeof data.entity[field] === 'object'">
                            {{ data.entity[field]?.name ?? JSON.stringify(data.entity[field]) }}
                        </span>
                        <span v-else>{{ data.entity[field] }}</span>
                    </template>
                </Column>
                <template #empty>The Recycle Bin is empty</template>
                <template #loading>Loading data...</template>
            </DataTable>
        </section>
        <template #footer>
            <Button label="Close" icon="pi pi-times" class="p-button-text" @click="recycleDialogVisible = false" />
        </template>
    </Dialog>

    <Dialog ref="historyDialog" v-model:visible="historyDialogVisible" :modal="true" class="p-fluid">
        <template #header>
            <div class="flex flex-row gap-5 w-full">
                <span class="flex align-items-center justify-content-center">History</span>
                <select class="p-component p-inputtext flex align-items-center justify-content-center w-14rem"
                    @change="onHistoryChange">
                    <option v-for="item in historyItems" :key="item.date">{{ item.date }}</option>
                </select>
                <ProgressSpinner v-if="historyDialogLoading"
                    class="flex align-items-center justify-content-center w-2rem" style="width: 50px; height: 50px" />
            </div>
        </template>
        <section>
            <div class="field grid" v-for="key of Object.keys(selectedHistoryItem.entity)" :key="key">
                <label :for="key" class="col-4">{{ camelCaseToTitle(key) }}:</label>
                <span class="col-8" v-if="selectedHistoryItem.entity[key] instanceof Date">
                    {{ selectedHistoryItem.entity[key].toLocaleString() }}
                </span>
                <span class="col-8" v-else-if="typeof selectedHistoryItem.entity[key] === 'object'">
                    {{ selectedHistoryItem.entity[key]?.name ?? JSON.stringify(selectedHistoryItem.entity[key]) }}
                </span>
                <span class="col-8" v-else>{{ selectedHistoryItem.entity[key] }}</span>
            </div>
        </section>
        <template #footer>
            <Button label="Close" icon="pi pi-times" class="p-button-text" @click="historyDialogVisible = false" />
        </template>
    </Dialog>
</template>

<style scoped>
select {
    appearance: auto;
}
</style>