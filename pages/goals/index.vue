<script setup lang="ts">
import { GoalsStore } from '~/stores/GoalsStore'

const store = GoalsStore()
</script>

<template>
    <h1>Goals</h1>
    <PegsCards :store="store" />
</template>