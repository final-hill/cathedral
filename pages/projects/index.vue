<script setup lang="ts">
import { ProjectRepository } from '~/data/ProjectRepository';

const repo = new ProjectRepository()

useHead({ title: 'Projects' })
</script>

<template>
    <PegsCards :repo="repo" />
</template>