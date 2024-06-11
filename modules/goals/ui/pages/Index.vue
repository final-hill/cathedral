<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import GoalsRepository from '../../data/GoalsRepository';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import CreateGoalsUseCase from '../../application/CreateGoalsUseCase';

useHead({
    title: 'Goals'
})

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

const links = [
    { name: 'Rationale', icon: 'pi-book', label: 'Rationale' },
    { name: 'Outcomes', icon: 'pi-check-circle', label: 'Outcomes' },
    { name: 'Stakeholders', icon: 'pi-users', label: 'Stakeholders' },
    { name: 'Use Cases', icon: 'pi-briefcase', label: 'Use Cases' },
    { name: 'Obstacles', icon: ' pi-exclamation-triangle', label: 'Obstacles' },
    { name: 'Limitations', icon: 'pi-exclamation-circle', label: 'Limitations' }
]
</script>

<template>
    <p>
        Goals are the desired outcomes and needs of an
        organization for which a system must satisfy.
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { solutionSlug: slug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>