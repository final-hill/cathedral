<script setup lang="ts">
import { ProjectRepository } from '~/data/ProjectRepository';

const route = useRoute(),
    repo = new ProjectRepository(),
    project = ref(await repo.get(route.path.split('/')[2])!)
</script>

<template>
    <h2>{{ project.name }}</h2>
</template>