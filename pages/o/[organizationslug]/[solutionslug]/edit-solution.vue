<script lang="ts" setup>
import { Solution } from '#shared/domain'
import { slugify } from '#shared/utils'
import type { z } from 'zod'

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
        await $fetch(`/api/solution/${oldSlug}`, {
            method: 'PUT',
            body: {
                organizationSlug,
                name: data.name,
                description: data.description
            }
        }).catch(e => $eventBus.$emit('page-error', e))

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
        :on-submit="updateSolution"
        :on-cancel="cancel"
        @update:state="handleStateUpdate"
    />
</template>
