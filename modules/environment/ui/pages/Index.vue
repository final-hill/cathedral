<script lang="ts" setup>
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import SolutionInteractor from '~/modules/solution/application/SolutionInteractor';

useHead({ title: 'Environment' })

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0];

if (!solution)
    router.push({ name: 'Solutions' });

const links = [
    { name: 'Assumptions', icon: 'pi-sun', label: 'Assumptions' },
    { name: 'Components', icon: 'pi-th-large', label: 'Components' },
    { name: 'Constraints', icon: 'pi-link', label: 'Constraints' },
    { name: 'Effects', icon: 'pi-bolt', label: 'Effects' },
    { name: 'Glossary', icon: 'pi-book', label: 'Glossary' },
    { name: 'Invariants', icon: 'pi-lock', label: 'Invariants' }
]
</script>

<template>
    <p>
        An environment is the set of entities (people, organizations, regulations, devices and other material objects,
        other systems) external to the project or system but with the potential to affect it or be affected by it.
    </p>

    <div class="grid">
        <NuxtLink v-for="link in links" :key="link.name" :to="{ name: link.name, params: { solutionSlug: slug } }"
            class="col-fixed w-2 mr-4">
            <Button :label="link.label" class="w-full h-5rem text-1xl" :icon="`pi ${link.icon} text-3xl`" iconPos="top"
                severity="secondary" />
        </NuxtLink>
    </div>
</template>