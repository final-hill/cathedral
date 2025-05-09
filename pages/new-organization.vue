<script lang="ts" setup>
import { slugify } from '#shared/utils';
import { z } from 'zod';
import { Organization } from '#shared/domain';

definePageMeta({ name: 'New Organization', middleware: 'auth' })
useHead({ title: 'New Organization' })

const router = useRouter(),
    { $eventBus } = useNuxtApp()

const formSchema = Organization.innerType().pick({
    name: true,
    slug: true,
    description: true
});

type FormSchema = z.infer<typeof formSchema>;

const formState = reactive<FormSchema>({
    name: '',
    slug: '',
    description: '',
});

const createOrganization = async (data: FormSchema) => {
    const newSlug = (await $fetch('/api/organization', {
        method: 'post',
        body: data
    }).catch((e) => $eventBus.$emit('page-error', e)));

    if (newSlug)
        router.push({ name: 'Organization', params: { organizationslug: data.slug } });
    else
        $eventBus.$emit('page-error', 'Failed to create organization. No organization ID returned.');
}

const cancel = () => {
    router.push({ name: 'Home' });
}

watch(() => formState.name, (newName) => {
    formState.slug = slugify(newName);
});
</script>

<template>
    <XForm :schema="formSchema" :state="formState" :onSubmit="createOrganization" :onCancel="cancel" />
</template>