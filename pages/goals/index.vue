<script setup lang="ts">
import { GoalsRepository } from '~/data/GoalsRepository';

const repo = new GoalsRepository()
</script>

<template>
    <h1>Goals</h1>
    <PegsCards :repo="repo" />
</template>