<script lang="ts" setup>
import type { OrganizationViewModel } from '#shared/models';
import { slugify } from '#shared/utils';

useHead({ title: 'Edit Organization' })
definePageMeta({ name: 'Edit Organization' })

const router = useRouter(),
    { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('Edit Organization').params,
    { data: organization, error: getOrgError } = await useFetch<OrganizationViewModel>(`/api/organization/${organizationSlug}`)

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found');
}

const oldSlug = organization.value.slug,
    newSlug = ref(organization.value.slug);

const updateOrganization = async () => {
    try {
        await $fetch(`/api/organization/${oldSlug}`, {
            method: 'PUT',
            body: {
                name: organization.value!.name,
                description: organization.value!.description
            }
        })

        router.push({ name: 'Organization', params: { organizationslug: newSlug.value } });
    } catch (error) {
        $eventBus.$emit('page-error', error);
    }
}

const cancel = () => {
    router.push({ name: 'Organization', params: { organizationslug: oldSlug } });
}

watch(() => organization.value!.name, (newName) => {
    newSlug.value = slugify(newName);
});
</script>

<template>
    <form v-if="organization" autocomplete="off" @submit.prevent="updateOrganization" @reset="cancel">
        <div class="field grid">
            <label for="name" class="required col-fixed w-7rem">Name</label>
            <InputText v-model.trim="organization.name" name="name" class="w-23rem col"
                placeholder="Sample Organization" :maxlength="100" />
        </div>

        <div class="field grid">
            <label for="slug" class="col-fixed w-7rem">Slug</label>
            <InputText name="slug" disabled tabindex="-1" v-model="newSlug" variant="filled" class="w-23rem col" />
        </div>

        <div class="field grid">
            <label for="description" class="col-fixed w-7rem">Description</label>
            <InputText name="description" placeholder="A description of the organization" class="w-23rem col"
                v-model.trim="organization.description" />
        </div>

        <Toolbar class="w-30rem">
            <template #center>
                <Button type="submit" class="mr-4" label="Update" severity="info" />
                <Button type="reset" class="ml-4" label="Cancel" severity="secondary" />
            </template>
        </Toolbar>
    </form>
</template>