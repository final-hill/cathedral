<script lang="ts" setup>
import type { Requirement } from '~/server/domain/requirements/Requirement';
import type { ParsedRequirement } from '~/server/domain/requirements/ParsedRequirement.js';

type RowType = { type: string; id: string; name: string; }

const props = defineProps<{
    parsedRequirement: ParsedRequirement,
    onApprove: (parentId: string, itemId: string) => Promise<void>,
    onReject: (parentId: string, itemId: string) => Promise<void>
}>()

const confirm = useConfirm()

const requirements: Requirement[][] = Object.values(props.parsedRequirement).filter(Array.isArray)

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
        <template #list="{ items }">
            <div v-for="(requirements, index) in items" :key="index" :value="requirements">
                <DataTable :value="requirements">
                    <template #header>
                        <div class="flex flex-wrap align-items-center justify-content-between gap-2">
                            <span class="text-xl text-900 font-bold">{{ requirements[0].type }}</span>
                        </div>
                    </template>
                    <Column v-for="col of Object.keys(requirements[0])" :key="col" :field="col" :header="col">
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