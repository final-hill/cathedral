<script lang="ts" setup>
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import EnvironmentRepository from '../../data/EnvironmentRepository';
import GetEnvironmentBySolutionIdUseCase from '../../application/GetEnvironmentBySolutionIdUseCase';
import CreateEnvironmentUseCase from '../../application/CreateEnvironmentUseCase';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    environmentRepository = new EnvironmentRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    getEnvironmentBySolutionIdUseCase = new GetEnvironmentBySolutionIdUseCase(environmentRepository),
    createEnvironmentUseCase = new CreateEnvironmentUseCase(environmentRepository),
    solution = await getSolutionBySlugUseCase.execute(slug)

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    const environment = await getEnvironmentBySolutionIdUseCase.execute(solution.id);

    if (!environment)
        await createEnvironmentUseCase.execute(solution.id);
}
</script>

<template>
    <p>
        An environment is the set of entities (people, organizations, regulations, devices and other material objects,
        other systems) external to the project or system but with the potential to affect it or be affected by it.
    </p>

    <div class="grid">
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Assumptions', params: { solutionSlug: slug } }">
            <Button label="Assumptions" class="w-full h-5rem text-1xl" icon="pi pi-sun text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Components', params: { solutionSlug: slug } }">
            <Button label="Components" class="w-full h-5rem text-1xl" icon="pi pi-th-large text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Constraints', params: { solutionSlug: slug } }">
            <Button label="Constraints" class="w-full h-5rem text-1xl" icon="pi pi-link text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Effects', params: { solutionSlug: slug } }">
            <Button label="Effects" class="w-full h-5rem text-1xl" icon="pi pi-bolt text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Glossary', params: { solutionSlug: slug } }">
            <Button label="Glossary" class="w-full h-5rem text-1xl" icon="pi pi-book text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Invariants', params: { solutionSlug: slug } }">
            <Button label="Invariants" class="w-full h-5rem text-1xl" icon="pi pi-lock text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>