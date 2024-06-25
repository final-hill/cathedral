<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';

useHead({ title: 'Project' })

const slug = useRoute().params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    links = [
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