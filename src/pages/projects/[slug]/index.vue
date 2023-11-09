<script setup lang="ts">
import { ProjectRepository } from '~/data/ProjectRepository';

const route = useRoute(),
    repo = new ProjectRepository(),
    project = ref(await repo.getBySlug(route.path.split('/')[2])!)

useHead({ title: project.value.name })
</script>

<template></template>