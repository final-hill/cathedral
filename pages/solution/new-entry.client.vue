<script lang="ts" setup>
import slugify from '~/lib/slugify';
import Solution from '~/server/domain/Solution';

useHead({ title: 'New Solution' })
definePageMeta({ name: 'New Solution' })

const router = useRouter(),
    name = ref(''),
    slug = ref(''),
    description = ref('')

const createSolution = async () => {
    try {
        const solutionId = (await $fetch('/api/solutions', {
            method: 'post',
            body: {
                name: name.value,
                description: description.value,
            }
        }))

        if (solutionId) {
            const newSolution = (await $fetch(`/api/solutions/${solutionId}`));
            router.push({ name: 'Solution', params: { slug: newSolution?.slug } });
        }
    } catch (error) {
        console.error(error)
    }
}

const cancel = () => {
    router.push({ name: 'Solutions' });
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
                    :maxlength="Solution.maxNameLength" required />
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
                    class="w-23rem" :maxlength="Solution.maxDescriptionLength" v-model.trim="description" />
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