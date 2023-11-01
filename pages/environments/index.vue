<script setup lang="ts">
import { EnvironmentRepository } from '~/data/EnvironmentRepository';

const repo = new EnvironmentRepository()

useHead({ title: 'Environments' })
</script>

<template>
    <PegsCards :repo="repo" />
</template>