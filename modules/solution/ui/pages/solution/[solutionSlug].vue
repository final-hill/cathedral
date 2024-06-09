<script lang="ts" setup>
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug)

if (!solution)
    router.push({ name: 'Solutions' });
</script>

<template>
    <div class="grid">
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Project', params: { solutionSlug: slug } }">
            <Button label="Project" class="w-full h-5rem text-1xl" icon="pi pi-box text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Environment', params: { solutionSlug: slug } }">
            <Button label="Environment" class="w-full h-5rem text-1xl" icon="pi pi-cloud text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'Goals', params: { solutionSlug: slug } }">
            <Button label="Goals" class="w-full h-5rem text-1xl" icon="pi pi-bullseye text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
        <NuxtLink class="col-fixed w-2 mr-4" :to="{ name: 'System', params: { solutionSlug: slug } }">
            <Button label="System" class="w-full h-5rem text-1xl" icon="pi pi-sitemap text-3xl" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>