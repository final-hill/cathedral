<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ProjectStore } from '~/stores/ProjectStore'

const { projects } = storeToRefs(ProjectStore())
</script>

<style scoped>
.project-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30%, 1fr));
    gap: 0.5in;
}

.project-card:first-child {
    background-color: transparent;
    border: 1px dashed var(--font-color);
}
</style>

<template>
    <section class="project-cards">
        <ProjectCard id="new-project" name="New Project" description="Create a new project" />
        <p v-if="projects.length === 0">No projects yet.</p>
        <ProjectCard v-else v-for="project of projects" :key="project.id" :id="project.id" :name="project.name"
            :description="project.description" />
    </section>
</template>