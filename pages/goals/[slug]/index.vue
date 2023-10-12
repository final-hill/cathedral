<script setup lang="ts">
import { GoalsStore } from '~/stores/GoalsStore'

const route = useRoute(),
    goalsStore = GoalsStore(),
    goals = goalsStore.getById(route.path.split('/')[2])!
</script>

<template>
    <h2>{{ goals.name }}</h2>
</template>

<style></style>