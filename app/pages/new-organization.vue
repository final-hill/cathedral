<script lang="ts" setup>
import { z } from 'zod'
import { Organization } from '#shared/domain'

definePageMeta({ name: 'New Organization', middleware: 'auth' })
useHead({ title: 'New Organization' })

const router = useRouter(),
    { fetch: refreshSession } = useUserSession(),
    formSchema = Organization.pick({
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
    createOrganization = async (data: FormSchema) => {
        const { data: newSlug } = await useApiRequest({ url: '/api/organization', options: {
            method: 'POST',
            body: data,
            schema: z.string(),
            showSuccessToast: true,
            successMessage: 'Organization created successfully',
            errorMessage: 'Failed to create organization'
        } })

        if (newSlug.value) {
            await refreshSession()
            router.push({ name: 'Organization', params: { organizationslug: newSlug.value } })
        }
    },
    cancel = () => {
        router.push({ name: 'Home' })
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
        @submit="createOrganization"
        @cancel="cancel"
    />
</template>
