<script lang="ts" setup>
import type Dialog from 'primevue/dialog'
import camelCaseToTitle from '~/utils/camelCaseToTitle.js';
import type { Requirement } from '~/server/domain/Requirement.js';
import type { ParsedRequirement, ParsedReqColType } from '~/server/domain/ParsedRequirement.js';

const props = defineProps<{
    parsedRequirement: ParsedRequirement,
    onItemApprove: (type: ParsedReqColType, itemId: string) => Promise<void>,
    onItemUpdate: (type: ParsedReqColType, data: Requirement) => Promise<void>,
    onItemDelete: (type: ParsedReqColType, itemId: string) => Promise<void>
}>()

const editDialog = ref<Dialog>(),
    editDialogVisible = ref(false),
    editDialogItem = ref<Requirement>(Object.create(null)),
    dataView = ref<DataView>()

type RequirementType = { type: ParsedReqColType, items: Requirement[] }

const groupRequirements = () =>
    Object.entries(props.parsedRequirement)
        .filter(([_, value]) => Array.isArray(value) && value.length > 0)
        .map(([key, value]) => ({ type: key as ParsedReqColType, items: value as Requirement[] }))

const requirements = ref<RequirementType[]>(groupRequirements())

const onItemDelete = async (type: ParsedReqColType, item: Requirement) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`))
        await props.onItemDelete(type, item.id)
}

const onItemApprove = async (type: ParsedReqColType, item: Requirement) => {
    await props.onItemApprove(type, item.id)
}

const openEditDialog = async (type: ParsedReqColType, item: Requirement) => {
    editDialogItem.value = { ...item }
    editDialogVisible.value = true
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
    }, {} as Requirement)

    // await props.onItemUpdate('{unknown}', data)
    editDialogVisible.value = false
    editDialogItem.value = Object.create(null)
}

const onEditDialogCancel = () => {
    editDialogVisible.value = false
    editDialogItem.value = Object.create(null)
}

const reqKeys = (req: object) => Object.keys(req)
    .filter(key => !['id', 'lastModified', 'modifiedBy', 'follows', 'solution'].includes(key))

</script>
<template>
    <DataView :value="requirements" :data-key="undefined" ref="dataView">
        <template #list="{ items }: { items: RequirementType[] }">
            <div class="mt-3" v-for="(requirements, index) in items" :key="index" :value="requirements">
                <DataTable :value="requirements.items">
                    <template #header>
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <span class="text-xl text-900 font-bold">{{ camelCaseToTitle(requirements.type) }}</span>
                        </div>
                    </template>
                    <Column v-for="col of reqKeys(requirements.items[0])" :key="col" :field="col"
                        :header="camelCaseToTitle(col)">
                    </Column>
                    <Column header="Actions" frozen align-frozen="right">
                        <template #body="{ data }">
                            <Button icon="pi pi-check" text rounded class="mr-2" severity="success" title="Approve"
                                @click="onItemApprove(requirements.type, data)" />
                            <!-- <Button icon="pi pi-pencil" text rounded class="mr-2" title="Edit"
                                @click="openEditDialog(requirements.type, data)" /> -->
                            <Button icon="pi pi-trash" text rounded severity="danger" title="Delete"
                                @click="onItemDelete(requirements.type, data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </template>
    </DataView>

    <!-- FIXME: This is too generic to be useful. field types are needed. -->
    <Dialog ref="editDialog" v-model:visible="editDialogVisible" :modal="true" class="p-fluid">
        <template #header>Edit Item</template>
        <form id="editDialogForm" autocomplete="off" @submit.prevent="onEditDialogSave" @reset="onEditDialogCancel">
            <div class="field grid" v-for="key in reqKeys(editDialogItem)">
                <label :for="key" class="col-4">{{ camelCaseToTitle(key) }}</label>
                <input :id="key" :name="key" v-model="(editDialogItem as any)[key]" class="col" required />
            </div>
        </form>
        <template #footer>
            <Button label="Save" type="submit" form="editDialogForm" icon="pi pi-check" class="p-button-text" />
            <Button label="Cancel" type="reset" form="editDialogForm" icon="pi pi-times" class="p-button-text" />
        </template>
    </Dialog>
</template>