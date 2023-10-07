<script setup lang="ts">
import { ProjectStore } from '~/stores/ProjectStore'

const route = useRoute(),
    projectStore = ProjectStore(),
    project = projectStore.getById(route.path.split('/')[2])!
</script>

<template>
    <h2>{{ project.name }}</h2>
</template>