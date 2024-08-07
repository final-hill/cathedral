<script lang="ts" setup>
useHead({ title: 'New Solution' })
definePageMeta({ name: 'New Solution' })

const { organizationslug } = useRoute('New Solution').params,
    router = useRouter(),
    name = ref(''),
    slug = ref(''),
    description = ref('')

const { data: organizations } = await useFetch('/api/organizations', {
    query: { slug: organizationslug }
}),
    organization = organizations.value![0],
    organizationId = organization.id

const createSolution = async () => {
    try {
        const solutionId = (await $fetch('/api/solutions', {
            method: 'post',
            body: {
                name: name.value,
                description: description.value,
                organizationId
            }
        }))

        if (solutionId) {
            const newSolution = (await $fetch(`/api/solutions/${solutionId}`));
            router.push({ name: 'Solution', params: { organizationslug, solutionslug: newSolution.slug } });
        } else {
            throw new Error('Failed to create solution. No solution ID returned.');
        }
    } catch (error) {
        console.error(error)
    }
}

const cancel = () => {
    router.push({ name: 'Organization', params: { organizationslug } });
}

watch(() => name.value, (newName) => {
    slug.value = slugify(newName);
});
</script>

<template>
    <form autocomplete="off" @submit.prevent="createSolution" @reset="cancel">
        <div class="field grid">
            <label for="name" class="required col-fixed w-7rem">Name</label>
            <div class="col">
                <InputText v-model.trim="name" id="name" name="name" class="w-23rem" placeholder="Sample Solution"
                    :maxlength="100" required />
            </div>
        </div>

        <div class="field grid">
            <label for="slug" class="col-fixed w-7rem">Slug</label>
            <div class="col">
                <InputText id="slug" name="slug" disabled tabindex="-1" v-model="slug" variant="filled"
                    class="w-23rem" />
            </div>
        </div>

        <div class="field grid">
            <label for="description" class="col-fixed w-7rem">Description</label>
            <div class="col">
                <InputText id="description" name="description" placeholder="A description of the solution"
                    class="w-23rem" v-model.trim="description" />
            </div>
        </div>

        <Toolbar class="w-30rem">
            <template #center>
                <Button type="submit" class="mr-4" label="Create" severity="info" />
                <Button type="reset" class="ml-4" label="Cancel" severity="secondary" />
            </template>
        </Toolbar>
    </form>
</template>