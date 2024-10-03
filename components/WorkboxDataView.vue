<script lang="ts" setup>
import type { Requirement } from '~/server/domain/Requirement.js';
import type { ParsedRequirement } from '~/server/domain/ParsedRequirement.js';

type RowType = { id: string; name: string; }

const props = defineProps<{
    parsedRequirement: ParsedRequirement,
    onApprove: (parentId: string, itemId: string) => Promise<void>,
    onReject: (parentId: string, itemId: string) => Promise<void>
}>()

const confirm = useConfirm()

type RequirementType = { type: string, items: Requirement[] }

const requirements: RequirementType[] = Object.entries(props.parsedRequirement)
    .filter(([_, value]) => Array.isArray(value) && value.length > 0)
    .map(([key, value]) => ({ type: key, items: value as Requirement[] }))

const onReject = (parentId: string, item: RowType) => new Promise<void>((resolve, _reject) => {
    confirm.require({
        message: `Are you sure you want to reject ${item.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Reject',
        accept: async () => {
            await props.onReject(parentId, item.id)
            resolve()
        },
        reject: () => { }
    })
})
</script>
<template>
    <ConfirmDialog></ConfirmDialog>
    <DataView :value="requirements" :data-key="undefined">
        <template #list="{ items }: { items: RequirementType[] }">
            <div v-for="(requirements, index) in items" :key="index" :value="requirements">
                <DataTable :value="requirements.items">
                    <template #header>
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <span class="text-xl text-900 font-bold">{{ requirements.type }}</span>
                        </div>
                    </template>
                    <Column v-for="col of Object.keys(requirements.items[0])" :key="col" :field="col" :header="col">
                    </Column>
                    <!--
                    <Column header="Actions" frozen align-frozen="right">
                        <template #body="{ data }">
                            <Button icon="pi pi-eye" class="text rounded mr-2" />
                            <Button icon="pi pi-trash" text rounded severity="danger" />
                        </template>
                    </Column>
                -->
                </DataTable>
            </div>
        </template>
    </DataView>
</template>