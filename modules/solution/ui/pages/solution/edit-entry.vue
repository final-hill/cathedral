<script lang="ts" setup>
import slugify from '~/lib/slugify';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import UpdateSolutionUseCase from '~/modules/solution/application/UpdateSolutionUseCase';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import Solution from '../solution.vue';

useHead({
    title: 'Edit Solution'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,
    solutionRepository = new SolutionRepository(),
    getSolutionBySlugUseCase = new GetSolutionBySlugUseCase(solutionRepository),
    updateSolutionUseCase = new UpdateSolutionUseCase(solutionRepository),
    solution = await getSolutionBySlugUseCase.execute(slug),
    name = ref(solution?.name || ''),
    newSlug = ref(solution?.slug || ''),
    description = ref(solution?.description || '')

if (!solution)
    router.push({ name: 'Solutions' });

const updateSolution = async () => {
    await updateSolutionUseCase.execute({
        id: solution!.id,
        name: name.value,
        description: description.value,
        environmentId: solution!.environmentId,
        goalsId: solution!.goalsId,
        projectId: solution!.projectId,
        systemId: solution!.systemId
    });

    router.push({ name: 'Solution', params: { solutionSlug: newSlug.value } });
}

const cancel = () => {
    router.push({ name: 'Solutions' });
}

watch(() => name.value, (newName) => {
    newSlug.value = slugify(newName);
});
</script>

<template>
    <form autocomplete="off" @submit.prevent="updateSolution" @reset="cancel">
        <div class="field grid">
            <label for="name" class="required col-fixed w-7rem">Name</label>
            <div class="col">
                <InputText v-model.trim="name" id="name" name="name" class="w-23rem" placeholder="Sample Solution"
                    :maxlength="Solution.maxNameLength" />
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
                <Button type="submit" class="mr-4" label="Update" severity="info" />
                <Button type="reset" class="ml-4" label="Cancel" severity="secondary" />
            </template>
        </Toolbar>
    </form>
</template>