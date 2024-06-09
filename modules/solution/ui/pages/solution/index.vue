<script lang="ts" setup>
import GetAllSolutionsUseCase from '~/modules/solution/application/GetAllSolutionsUseCase';
import SolutionRepository from '../../../data/SolutionRepository';
import type Solution from '../../../domain/Solution';
import GoalsRepository from '~/modules/goals/data/GoalsRepository';
import DeleteSolutionUseCase from '~/modules/solution/application/DeleteSolutionUseCase';

const solutionRepo = new SolutionRepository(),
    goalsRepo = new GoalsRepository(),
    getAllSolutionsUseCase = new GetAllSolutionsUseCase(solutionRepo),
    deleteSolutionUseCase = new DeleteSolutionUseCase({
        solutionRepository: solutionRepo,
        goalsRepository: goalsRepo
    }),
    solutions = ref<Solution[]>([]);

onMounted(async () => {
    solutions.value = await getAllSolutionsUseCase.execute();
});

const handleDelete = async (solution: Solution) => {
    if (confirm('Are you sure you want to delete this solution?')) {
        await deleteSolutionUseCase.execute(solution.id);
        solutions.value = solutions.value.filter((solution) => solution.id !== solution.id);
    }
}
</script>

<template>
    <DataView :value="solutions" layout="grid" dataKey="id">
        <template #grid="{ items }">
            <div class="grid gap-3">
                <Card class="col shadow-4">
                    <template #title>
                        <NuxtLink :to="{ name: 'New Solution' }">
                            New Solution
                        </NuxtLink>
                    </template>
                    <template #subtitle>
                        Create a new Solution
                    </template>
                </Card>
                <Card class="col shadow-4" v-for="(item, index) in items" :key="index">
                    <template #title>
                        <NuxtLink :to="{ name: 'Solution', params: { solutionSlug: item.slug } }">
                            {{ item.name }}
                        </NuxtLink>
                    </template>
                    <template #subtitle>
                        {{ item.description }}
                    </template>
                    <template #footer>
                        <Button icon="pi pi-trash" class="delete-button" @click="handleDelete(item)"
                            severity="danger" />
                    </template>
                </Card>
            </div>
        </template>
        <template #empty>
            <div class="grid">
                <Card class="col">
                    <template #title>
                        <NuxtLink :to="{ name: 'New Solution' }">
                            New Solution
                        </NuxtLink>
                    </template>
                    <template #subtitle>
                        Create a new Solution
                    </template>
                </Card>
            </div>
        </template>
    </DataView>
</template>