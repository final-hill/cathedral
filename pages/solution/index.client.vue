<script lang="ts" setup>
import type { Properties } from '~/server/domain/Properties';
import type { Uuid } from '~/server/domain/Uuid';

useHead({ title: 'Solutions' })
definePageMeta({ name: 'Solutions' })

const router = useRouter(),
    { refresh, status, data: solutions } = await useFetch('/api/solutions'),
    confirm = useConfirm()

type SolutionModel = {
    id: Uuid;
    name: string;
    description: string;
    slug: string;
}

const handleDelete = async (solution: Properties<SolutionModel>) => {
    confirm.require({
        message: `Are you sure you want to delete ${solution.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await $fetch(`/api/solutions/${solution.id}`, {
                method: 'delete'
            })
            refresh()
        },
        reject: () => { }
    })
}

const handleEdit = (solution: SolutionModel) => {
    router.push({ name: 'Edit Solution', params: { slug: solution.slug } });
}
</script>

<template>
    <ConfirmDialog></ConfirmDialog>
    <div class="grid gap-3">
        <Card class="col shadow-4 border-dashed">
            <template #title>
                <NuxtLink :to="{ name: 'New Solution' }">
                    New Solution
                </NuxtLink>
            </template>
            <template #subtitle>
                Create a new Solution
            </template>
        </Card>
        <div v-if="status === 'pending'">
            <ProgressSpinner />
        </div>
        <Card class="col shadow-4" v-for="solution in solutions">
            <template #title>
                <NuxtLink :to="{ name: 'Solution', params: { slug: solution.slug } }">
                    {{ solution.name }}
                </NuxtLink>
            </template>
            <template #subtitle>
                {{ solution.description }}
            </template>
            <template #footer>
                <Button icon="pi pi-pencil" class="edit-button mr-2" @click="handleEdit(solution)" />
                <Button icon="pi pi-trash" class="delete-button" @click="handleDelete(solution)" severity="danger" />
            </template>
        </Card>
    </div>
</template>