<script setup lang="ts">
import { EnvironmentRepository } from '~/data/EnvironmentRepository';

const repo = new EnvironmentRepository()
</script>

<template>
    <h1>Environments</h1>
    <PegsCards :repo="repo" />
</template>