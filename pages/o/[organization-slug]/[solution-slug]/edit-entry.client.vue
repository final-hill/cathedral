<script lang="ts" setup>
useHead({ title: 'Edit Solution' })
definePageMeta({ name: 'Edit Solution' })

const route = useRoute('Edit Solution'),
    { $eventBus } = useNuxtApp(),
    { organizationslug, solutionslug } = route.params,
    router = useRouter(),
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution/`, {
        query: {
            organizationSlug: organizationslug,
            slug: solutionslug
        }
    }),
    solution = ref(solutions.value![0]),
    newSlug = ref(solution.value.slug);

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const updateSolution = async () => {
    await $fetch(`/api/solution/${solution.value.id}`, {
        method: 'PUT',
        body: {
            name: solution.value.name,
            description: solution.value.description
        }
    }).catch((e) => $eventBus.$emit('page-error', e));

    router.push({ name: 'Organization', params: { organizationslug } });
}

const cancel = () => {
    router.push({ name: 'Solution', params: { organizationslug, solutionslug } });
}

watch(() => solution.value.name, (newName) => {
    newSlug.value = slugify(newName);
});
</script>

<template>
    <form autocomplete="off" @submit.prevent="updateSolution" @reset="cancel">
        <div class="field grid">
            <label for="name" class="required col-fixed w-7rem">Name</label>
            <InputText v-model.trim="solution.name" name="name" class="w-23rem col" placeholder="Sample Solution"
                :maxlength="100" />
        </div>

        <div class="field grid">
            <label for="slug" class="col-fixed w-7rem">Slug</label>
            <InputText name="slug" disabled tabindex="-1" v-model="newSlug" variant="filled" class="w-23rem col" />
        </div>

        <div class="field grid">
            <label for="description" class="col-fixed w-7rem">Description</label>
            <InputText name="description" placeholder="A description of the solution" class="w-23rem col"
                v-model.trim="solution.description" />
        </div>

        <Toolbar class="w-30rem">
            <template #center>
                <Button type="submit" class="mr-4" label="Update" severity="info" />
                <Button type="reset" class="ml-4" label="Cancel" severity="secondary" />
            </template>
        </Toolbar>
    </form>
</template>