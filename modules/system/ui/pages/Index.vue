<script lang="ts" setup>
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import GetSystemBySolutionIdUseCase from '../../application/GetSystemBySolutionIdUseCase';
import SystemRepository from '../../data/SystemRepository';
import CreateSystemComponentUseCase from '../../application/CreateSystemComponentUseCase';
import UpdateSolutionUseCase from '~/modules/solution/application/UpdateSolutionUseCase';
import CreateSystemUseCase from '../../application/CreateSystemUseCase';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    systemRepository = new SystemRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    getSystemBySolutionIdUseCase = new GetSystemBySolutionIdUseCase(systemRepository),
    createSystemUseCase = new CreateSystemUseCase(systemRepository),
    updateSolutionUseCase = new UpdateSolutionUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug)

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    const system = await getSystemBySolutionIdUseCase.execute(solution.id);

    if (!system) {
        const newId = await createSystemUseCase.execute(solution.id);

        await updateSolutionUseCase.execute({
            id: solution.id,
            name: solution.name,
            description: solution.description,
            environmentId: solution.environmentId,
            goalsId: solution.goalsId,
            projectId: solution.projectId,
            systemId: newId
        });
    }
}

const links = [
    { name: 'System Components', icon: 'pi-th-large', label: 'Components' },
    { name: 'Functionality', icon: 'pi-bolt', label: 'Functionality' }
]
</script>

<template>
    <h1>System</h1>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { solutionSlug: slug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>