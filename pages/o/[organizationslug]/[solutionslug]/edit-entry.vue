<script lang="ts" setup>
import { Solution } from '#shared/domain'
import { slugify } from '#shared/utils';
import { z } from 'zod';

useHead({ title: 'Edit Solution' })
definePageMeta({ name: 'Edit Solution', middleware: 'auth' })

const route = useRoute('Edit Solution'),
    { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug, solutionslug: slug } = route.params,
    router = useRouter(),
    { data: solution, error: getSolutionError } = await useFetch(`/api/solution/${slug}`, {
        query: { organizationSlug }
    })

if (!solution.value) {
    $eventBus.$emit('page-error', getSolutionError.value);
    throw new Error('Solution not found');
}

const oldSlug = solution.value.slug

const formSchema = Solution.innerType().pick({
    name: true,
    slug: true,
    description: true
});

type FormSchema = z.infer<typeof formSchema>;

const formState = reactive<FormSchema>({
    name: solution.value.name,
    slug: solution.value.slug,
    description: solution.value.description
});

const updateSolution = async (data: FormSchema) => {
    await $fetch(`/api/solution/${oldSlug}`, {
        method: 'PUT',
        body: {
            organizationSlug,
            name: data.name,
            description: data.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    router.push({ name: 'Organization', params: { organizationslug: organizationSlug } });
}

const cancel = () => {
    router.push({ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: slug } });
}

watch(() => formState.name, (newName) => {
    formState.slug = slugify(newName);
});
</script>

<template>
    <h1>Edit Solution</h1>

    <XForm :schema="formSchema" :state="formState" :onSubmit="updateSolution" :onCancel="cancel" />
</template>