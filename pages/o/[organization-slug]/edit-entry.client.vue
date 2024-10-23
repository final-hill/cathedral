<script lang="ts" setup>
useHead({ title: 'Edit Organization' })
definePageMeta({ name: 'Edit Organization' })

const router = useRouter(),
    { $eventBus } = useNuxtApp(),
    { organizationslug } = useRoute('Edit Organization').params,
    { data: organizations, error: getOrgError } = await useFetch(`/api/organization/`, { query: { slug: organizationslug } }),
    organization = ref(organizations.value![0]),
    newSlug = ref(organization.value.slug);

if (getOrgError.value)
    $eventBus.$emit('page-error', getOrgError.value);

const updateOrganization = async () => {
    await $fetch(`/api/organization/${organization.value.id}`, {
        method: 'PUT',
        body: {
            name: organization.value.name,
            description: organization.value.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    router.push({ name: 'Organization', params: { organizationslug: newSlug.value } });
}

const cancel = () => {
    router.push({ name: 'Organization', params: { organizationslug: newSlug.value } });
}

watch(() => organization.value.name, (newName) => {
    newSlug.value = slugify(newName);
});
</script>

<template>
    <form autocomplete="off" @submit.prevent="updateOrganization" @reset="cancel">
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