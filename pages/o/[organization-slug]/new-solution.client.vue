<script lang="ts" setup>
import slugify from '~/shared/slugify.js';
import type { OrganizationViewModel } from '~/shared/models'

useHead({ title: 'New Solution' })
definePageMeta({ name: 'New Solution' })

const { $eventBus } = useNuxtApp(),
    { organizationslug: organizationSlug } = useRoute('New Solution').params,
    router = useRouter(),
    name = ref(''),
    slug = ref(''),
    description = ref('')

const { data: organization, error: getOrgError } = await useFetch<OrganizationViewModel[]>(`/api/organization/${organizationSlug}`)

if (!organization.value) {
    $eventBus.$emit('page-error', getOrgError.value)
    throw new Error('Organization not found')
}

const createSolution = async () => {
    try {
        const newSolutionSlug = (await $fetch('/api/solution', {
            method: 'post',
            body: {
                name: name.value,
                description: description.value,
                organizationSlug
            }
        }).catch((e) => $eventBus.$emit('page-error', e)));

        if (newSolutionSlug) {
            router.push({ name: 'Solution', params: { organizationslug: organizationSlug, solutionslug: newSolutionSlug } });
        } else {
            $eventBus.$emit('page-error', 'Failed to create solution. No solution slug returned.');
        }
    } catch (error) {
        console.error(error)
    }
}

const cancel = () => {
    router.push({ name: 'Organization', params: { organizationslug: organizationSlug } });
}

watch(() => name.value, (newName) => {
    slug.value = slugify(newName);
});
</script>

<template>
    <form autocomplete="off" @submit.prevent="createSolution" @reset="cancel">
        <div class="field grid">
            <label for="name" class="required col-fixed w-7rem">Name</label>
            <InputText v-model.trim="name" name="name" class="w-23rem col" placeholder="Sample Solution"
                :maxlength="100" required />
        </div>

        <div class="field grid">
            <label for="slug" class="col-fixed w-7rem">Slug</label>
            <InputText name="slug" disabled tabindex="-1" v-model="slug" variant="filled" class="w-23rem col" />
        </div>

        <div class="field grid">
            <label for="description" class="col-fixed w-7rem">Description</label>
            <InputText name="description" placeholder="A description of the solution" class="w-23rem col"
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