<script lang="ts" setup>
import { z } from 'zod'
import { Solution, Organization } from '#shared/domain'

useHead({ title: 'New Solution' })
definePageMeta({ name: 'New Solution', middleware: 'auth' })

const { organizationslug: organizationSlug } = useRoute('New Solution').params,
    router = useRouter(),
    { data: organization } = await useApiRequest({ url: `/api/organization/${organizationSlug}`, options: {
        schema: Organization,
        errorMessage: 'Failed to load organization'
    } })

if (!organization.value)
    throw new Error('Organization not found')

const formSchema = Solution.pick({
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
        const { data: newSolutionSlug } = await useApiRequest({ url: '/api/solution', options: {
            method: 'POST',
            schema: z.string(),
            body: {
                name: data.name,
                description: data.description,
                organizationSlug
            },
            showSuccessToast: true,
            successMessage: 'Solution created successfully',
            errorMessage: 'Failed to create solution'
        } })

        router.push({ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: newSolutionSlug.value! } })
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
