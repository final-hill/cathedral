<script lang="ts" setup>
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';
import SolutionRepository from '../../../data/SolutionRepository';
import type Solution from '../../../domain/Solution';

useHead({ title: 'Solutions' })

const router = useRouter(),
    solutionRepository = new SolutionRepository(),
    solutionInteractor = new SolutionInteractor(solutionRepository),
    solutions = ref<Solution[]>([]),
    confirm = useConfirm()

onMounted(async () => {
    solutions.value = await solutionInteractor.getAll();
});

const handleDelete = async (solution: Solution) => {
    confirm.require({
        message: `Are you sure you want to delete ${solution.name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            await solutionInteractor.delete(solution.id);
            solutions.value = solutions.value.filter((s) => s.id !== solution.id);
        },
        reject: () => { }
    })
}

const handleEdit = (solution: Solution) => {
    router.push({ name: 'Edit Solution', params: { solutionSlug: solution.slug } });
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
        <Card class="col shadow-4" v-for="solution in solutions">
            <template #title>
                <NuxtLink :to="{ name: 'Solution', params: { solutionSlug: solution.slug } }">
                    {{ solution.name }}
                </NuxtLink>
            </template>
            <template #subtitle>
                {{ solution.description }}
            </template>
            <template #footer>
                <Button icon="pi pi-pencil" class="edit-button mr-2" @click="handleEdit(solution as Solution)" />
                <Button icon="pi pi-trash" class="delete-button" @click="handleDelete(solution as Solution)"
                    severity="danger" />
            </template>
        </Card>
    </div>
</template>