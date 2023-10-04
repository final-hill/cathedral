<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { ProjectStore } from '~/stores/ProjectStore'

const projectStore = ProjectStore(),
    { projects } = storeToRefs(projectStore)

const deleteProject = (id: string) => {
    if (confirm(`Are you sure you want to delete this project? id: ${id}`))
        projectStore.removeProject(id)
}
</script>

<template>
    <h1>Projects</h1>

    <ul>
        <li>
            <div class="project-metadata">
                <nuxt-link to="/projects/new-project">New Project</nuxt-link>
                <p>
                    <em>Create a new project</em>
                </p>
            </div>
            <div></div>
        </li>
        <li v-for="project of projects" :key="project.id">
            <div class="project-metadata">
                <nuxt-link :to="`/projects/${project.id}`">{{ project.name }}</nuxt-link>
                <p>{{ project.description }}</p>
            </div>
            <button @click="deleteProject(project.id)">Delete</button>
        </li>
    </ul>
</template>

<style scoped>
ul {
    font-size: larger;
}

li {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
</style>