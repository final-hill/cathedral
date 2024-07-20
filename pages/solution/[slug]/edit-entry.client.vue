<script lang="ts" setup>
import slugify from '~/lib/slugify';
import Solution from '~/server/domain/Solution';

useHead({ title: 'Edit Solution' })
definePageMeta({ name: 'Edit Solution' })

const router = useRouter(),
    slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions/`, { query: { slug } }),
    solution = ref(solutions.value![0]),
    newSlug = ref(solution.value.slug);

const updateSolution = async () => {
    await $fetch(`/api/solutions/${solution.value.id}`, {
        method: 'PUT',
        body: {
            name: solution.value.name,
            description: solution.value.description
        }
    });

    router.push({ name: 'Solution', params: { slug: newSlug.value } });
}

const cancel = () => {
    router.push({ name: 'Solutions' });
}

watch(() => solution.value.name, (newName) => {
    newSlug.value = slugify(newName);
});
</script>

<template>
    <form autocomplete="off" @submit.prevent="updateSolution" @reset="cancel">
        <div class="field grid">
            <label for="name" class="required col-fixed w-7rem">Name</label>
            <div class="col">
                <InputText v-model.trim="solution.name" id="name" name="name" class="w-23rem"
                    placeholder="Sample Solution" :maxlength="Solution.maxNameLength" />
            </div>
        </div>

        <div class="field grid">
            <label for="slug" class="col-fixed w-7rem">Slug</label>
            <div class="col">
                <InputText id="slug" name="slug" disabled tabindex="-1" v-model="newSlug" variant="filled"
                    class="w-23rem" />
            </div>
        </div>

        <div class="field grid">
            <label for="description" class="col-fixed w-7rem">Description</label>
            <div class="col">
                <InputText id="description" name="description" placeholder="A description of the solution"
                    class="w-23rem" v-model.trim="solution.description" />
            </div>
        </div>

        <Toolbar class="w-30rem">
            <template #center>
                <Button type="submit" class="mr-4" label="Update" severity="info" />
                <Button type="reset" class="ml-4" label="Cancel" severity="secondary" />
            </template>
        </Toolbar>
    </form>
</template>