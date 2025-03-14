<script lang="ts" setup>
import { slugify } from '#shared/utils';
import { z } from 'zod';
import { Solution } from '#shared/domain';

useHead({ title: 'New Solution' })
definePageMeta({ name: 'New Solution' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('New Solution').params,
    router = useRouter()

const { data: organization, error: getOrgError } = await useFetch(`/api/organization/${organizationSlug}`)

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found')
}

const formSchema = Solution.innerType().pick({
    name: true,
    slug: true,
    description: true
})

type FormSchema = z.infer<typeof formSchema>;

const formState = reactive<FormSchema>({
    name: '',
    slug: '',
    description: ''
});

const createSolution = async (data: FormSchema) => {
    try {
        const newSolutionSlug = await $fetch('/api/solution', {
            method: 'post',
            body: {
                name: data.name,
                description: data.description,
                organizationSlug
            }
        })

        router.push({ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: newSolutionSlug } });
    } catch (error) {
        $eventBus.$emit('page-error', error)
    }
}

const cancel = () => {
    router.push({ name: 'Organization', params: { organizationslug: organizationSlug } });
}

watch(() => formState.name, (newName) => {
    formState.slug = slugify(newName);
});
</script>

<template>
    <XForm :schema="formSchema" :state="formState" :onSubmit="createSolution" :onCancel="cancel" />
</template>