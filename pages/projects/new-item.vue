<script lang="ts" setup>
import { Project } from '~/domain/Project';
import { slugify } from '~/domain/slugify';
import { ProjectRepository } from '~/data/ProjectRepository';

const repo = new ProjectRepository(),
    router = useRouter();

const name = ref(''),
    slug = computed(() => slugify(name.value)),
    description = ref('')

const createProject = (e: Event) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement,
        formData = new FormData(form)

    const project = new Project({
        id: self.crypto.randomUUID(),
        name: formData.get('name') as string,
        description: formData.get('description') as string
    })
    repo.add(project)

    router.push(`/projects/${project.slug()}`)
}

</script>

<template>
    <h1>New Project</h1>
    <form class="project-form" autocomplete="off" @submit="createProject">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" :maxlength="Project.MAX_NAME_LENGTH" v-model="name"
            placeholder="Sample Project" required />

        <label>Slug</label>
        <span>{{ slug }}</span>
        <label for="description">Description</label>
        <input type="text" id="description" name="description" :maxlength="Project.MAX_DESCRIPTION_LENGTH"
            placeholder="A description of Sample Project" v-model="description" />

        <span id="actions">
            <button type="submit">Create</button>
            <button type="button" @click="$router.push('/projects')">Cancel</button>
        </span>
    </form>
</template>

<style scoped>
.project-form {
    display: grid;
    grid-template-columns: 20% 1fr;
    grid-gap: 1rem;
    margin: 1rem;
}

label {
    display: block;
}

label[for="name"]::after {
    content: ' *';
    color: red;
}

input {
    max-width: 80%;
    width: 40em;
}

button {
    width: 2in;
}

button[type="submit"] {
    background-color: var(--btn-okay-color);
}

#actions {
    grid-column: 2;
    display: flex;
    justify-content: space-between;
    max-width: 4.5in;
}
</style>