<script lang="ts" setup>
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import UpdateSolutionUseCase from '~/modules/solution/application/UpdateSolutionUseCase';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import ProjectRepository from '../../data/ProjectRepository';
import GetProjectBySolutionIdUseCase from '../../application/GetProjectBySolutionIdUseCase';
import CreateProjectUseCase from '../../application/CreateProjectUseCase';

useHead({
    title: 'Project'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    projectRepository = new ProjectRepository(),
    getProjectBySolutionIdUseCase = new GetProjectBySolutionIdUseCase(projectRepository),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    createProjectUseCase = new CreateProjectUseCase(projectRepository),
    updateSolutionUseCase = new UpdateSolutionUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug)

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    const project = await getProjectBySolutionIdUseCase.execute(solution.id);

    if (!project) {
        const newId = await createProjectUseCase.execute(solution.id);

        await updateSolutionUseCase.execute({
            id: solution.id,
            name: solution.name,
            description: solution.description,
            environmentId: solution.environmentId,
            goalsId: solution.goalsId,
            projectId: newId,
            systemId: solution.systemId
        });
    }
}

const links = [
    { name: 'Roles & Personnel', icon: 'pi-users', label: 'Roles & Personnel' }
]
</script>
<template>
    <p>
        A Project is the set of human processes involved in the plannimg, construction,
        revision, and operation of a system
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { solutionSlug: slug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>