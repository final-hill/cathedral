<script lang="ts" setup>
import { slugify } from '#shared/utils'
import type { z } from 'zod'
import { Solution } from '#shared/domain'

useHead({ title: 'New Solution' })
definePageMeta({ name: 'New Solution', middleware: 'auth' })

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

type FormSchema = z.infer<typeof formSchema>

const formState = reactive<FormSchema>({
    name: '',
    slug: '',
    description: ''
})

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

        router.push({ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: newSolutionSlug } })
    } catch (error) {
        $eventBus.$emit('page-error', error)
    }
}

const cancel = () => {
    router.push({ name: 'Organization', params: { organizationslug: organizationSlug } })
}

// Handle state updates from XForm component
const handleStateUpdate = (newState: Partial<FormSchema>) => {
    // Check if the name changed before updating formState
    const nameChanged = newState.name !== undefined && newState.name !== formState.name
    const newName = newState.name

    // Update our form state with changes from XForm
    Object.assign(formState, newState)

    // If the name changed, update the slug
    if (nameChanged && newName) {
        formState.slug = slugify(newName)
    }
}
</script>

<template>
    <XForm
        :schema="formSchema"
        :state="formState"
        :on-submit="createSolution"
        :on-cancel="cancel"
        @update:state="handleStateUpdate"
    />
</template>
