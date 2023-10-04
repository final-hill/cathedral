<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { ProjectStore } from '~/stores/ProjectStore'

const { projects } = storeToRefs(ProjectStore())
</script>

<template>
    <h1>Home</h1>
    <h2>Projects</h2>
    <ul>
        <li v-if="projects.length === 0">
            <p>No projects yet.</p>
        </li>
        <li v-for="project of projects" :key="project.id">
            <nuxt-link :to="`/projects/${project.id}`">{{ project.name }}</nuxt-link>
            <p>{{ project.description }}</p>
        </li>
    </ul>
</template>

<style scoped>
ul {
    font-size: larger;
}
</style>
```