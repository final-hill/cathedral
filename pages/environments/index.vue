<script setup lang="ts">
import { EnvironmentStore } from '~/stores/EnvironmentStore'

const store = EnvironmentStore()
</script>

<template>
    <h1>Environments</h1>
    <PegsCards :store="store" />
</template>