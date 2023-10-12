<script setup lang="ts">
import { ProjectStore } from '~/stores/ProjectStore'

const store = ProjectStore()
</script>

<template>
    <h1>Projects</h1>
    <PegsCards :store="store" />
</template>