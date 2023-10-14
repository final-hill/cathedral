<script setup lang="ts">
import { ProjectRepository } from '~/data/ProjectRepository';

const repo = new ProjectRepository()
</script>

<template>
    <h1>Projects</h1>
    <PegsCards :repo="repo" />
</template>