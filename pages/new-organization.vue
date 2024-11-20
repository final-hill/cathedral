<script lang="ts" setup>
import { slugify } from '#shared/utils';

useHead({ title: 'New Organization' })
definePageMeta({ name: 'New Organization' })

const router = useRouter(),
    { $eventBus } = useNuxtApp(),
    name = ref(''),
    slug = ref(''),
    description = ref('')

const createOrganization = async () => {
    try {
        const newSlug = (await $fetch('/api/organization', {
            method: 'post',
            body: {
                name: name.value,
                description: description.value,
            }
        }).catch((e) => $eventBus.$emit('page-error', e)));

        if (newSlug) {
            router.push({ name: 'Organization', params: { organizationslug: newSlug } });
        } else {
            $eventBus.$emit('page-error', 'Failed to create organization. No organization ID returned.');
        }
    } catch (error) {
        $eventBus.$emit('page-error', error);
    }
}

const cancel = () => {
    router.push({ name: 'Home' });
}

watch(() => name.value, (newName) => {
    slug.value = slugify(newName);
});
</script>

<template>
    <form autocomplete="off" @submit.prevent="createOrganization" @reset="cancel">
        <div class="field grid">
            <label for="name" class="required col-fixed w-7rem">Name</label>
            <InputText v-model.trim="name" name="name" class="w-23rem col" placeholder="Sample Organization" required />
        </div>

        <div class="field grid">
            <label for="slug" class="col-fixed w-7rem">Slug</label>
            <InputText name="slug" disabled tabindex="-1" v-model="slug" variant="filled" class="w-23rem col" />
        </div>

        <div class="field grid">
            <label for="description" class="col-fixed w-7rem">Description</label>
            <InputText name="description" placeholder="A description of the organization" class="w-23rem col"
                v-model.trim="description" />
        </div>

        <Toolbar class="w-30rem">
            <template #center>
                <Button type="submit" class="mr-4" label="Create" severity="info" />
                <Button type="reset" class="ml-4" label="Cancel" severity="secondary" />
            </template>
        </Toolbar>
    </form>
</template>