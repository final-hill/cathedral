<script lang="ts" setup>
import type { z } from 'zod'
import { Solution } from '#shared/domain'

useHead({ title: 'New Solution' })
definePageMeta({ name: 'New Solution', middleware: 'auth' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('New Solution').params,
    router = useRouter(),
    { data: organization, error: getOrgError } = await useFetch(`/api/organization/${organizationSlug}`)

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found')
}

const formSchema = Solution.innerType().pick({
    name: true,
    slug: true,
    description: true
})

type FormSchema = z.infer<typeof formSchema>

const formState = reactive<FormSchema>({
        name: '',
        slug: '',
        description: ''
    }),
    createSolution = async (data: FormSchema) => {
        try {
            const newSolutionSlug = await $fetch('/api/solution', {
                method: 'post',
                body: {
                    name: data.name,
                    description: data.description,
                    organizationSlug
                }
            })

            router.push({ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: newSolutionSlug } })
        } catch (error) {
            $eventBus.$emit('page-error', error)
        }
    },
    cancel = () => {
        router.push({ name: 'Organization', params: { organizationslug: organizationSlug } })
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
    <XForm
        :schema="formSchema"
        :state="formState"
        @update:state="handleStateUpdate"
        @submit="createSolution"
        @cancel="cancel"
    />
</template>
