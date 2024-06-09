<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import GoalsRepository from '../../data/GoalsRepository';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import CreateGoalsUseCase from '../../application/CreateGoalsUseCase';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    goalsRepository = new GoalsRepository(),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    createGoalsUseCase = new CreateGoalsUseCase(goalsRepository),
    solution = await getSolutionBySlugUseCase.execute(slug)

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    const goals = await getGoalsBySolutionIdUseCase.execute(solution.id);

    if (!goals)
        await createGoalsUseCase.execute(solution.id);
}
</script>

<template>
    <p>
        Goals are the desired outcomes and needs of an
        organization for which a system must satisfy.
    </p>

    <div class="grid">
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Rationale', params: { solutionSlug: slug } }">
            <Button label="Rationale" class="w-full h-5rem text-1xl" icon="pi pi-book text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Outcomes', params: { solutionSlug: slug } }">
            <Button label="Outcomes" class="w-full h-5rem text-1xl" icon="pi pi-check-circle text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Stakeholders', params: { solutionSlug: slug } }">
            <Button label="Stakeholders" class="w-full h-5rem text-1xl" icon="pi pi-users text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Use Cases', params: { solutionSlug: slug } }">
            <Button label="Use Cases" class="w-full h-5rem text-1xl" icon="pi pi-briefcase text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Obstacles', params: { solutionSlug: slug } }">
            <Button label="Obstacles" class="w-full h-5rem text-1xl" icon="pi pi-exclamation-triangle text-3xl"
                iconPos="top" severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Limitations', params: { solutionSlug: slug } }">
            <Button label="Limitations" class="w-full h-5rem text-1xl" icon="pi pi-exclamation-circle text-3xl"
                iconPos="top" severity="secondary" />
        </NuxtLink>
    </div>
</template>