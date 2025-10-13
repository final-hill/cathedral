<script lang="ts" setup>
import { Solution } from '#shared/domain'
import type { z } from 'zod'

useHead({ title: 'Edit Solution' })
definePageMeta({ name: 'Edit Solution', middleware: 'auth' })

const route = useRoute('Edit Solution'),
    { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug, solutionslug: slug } = route.params,
    router = useRouter(),
    { data: solution, error: getSolutionError } = await useApiRequest({ url: `/api/solution/${slug}`, options: {
        schema: Solution,
        query: { organizationSlug },
        errorMessage: 'Failed to load solution'
    } })

if (!solution.value) {
    $eventBus.$emit('page-error', getSolutionError.value)
    throw new Error('Solution not found')
}

const oldSlug = solution.value.slug,
    formSchema = Solution.innerType().pick({
        name: true,
        slug: true,
        description: true
    })

type FormSchema = z.infer<typeof formSchema>

const formState = reactive<FormSchema>({
        name: solution.value.name,
        slug: solution.value.slug,
        description: solution.value.description
    }),
    updateSolution = async (data: FormSchema) => {
        await useApiRequest({ url: `/api/solution/${oldSlug}`, options: {
            method: 'PUT',
            schema: Solution,
            body: {
                organizationSlug,
                name: data.name,
                description: data.description
            },
            showSuccessToast: true,
            successMessage: 'Solution updated successfully',
            errorMessage: 'Failed to update solution'
        } })

        router.push({ name: 'Organization', params: { organizationslug: organizationSlug } })
    },
    cancel = () => {
        router.push({ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: slug } })
    },
    handleStateUpdate = (newState: Partial<FormSchema>) => {
        const nameChanged = newState.name !== undefined && newState.name !== formState.name,
            newName = newState.name

        Object.assign(formState, newState)

        if (nameChanged && newName)
            formState.slug = slugify(newName)
    }
</script>

<template>
    <h1>Edit Solution</h1>

    <XForm
        :schema="formSchema"
        :state="formState"
        @update:state="handleStateUpdate"
        @submit="updateSolution"
        @cancel="cancel"
    />
</template>
