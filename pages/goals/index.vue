<script setup lang="ts">
import { GoalsRepository } from '~/data/GoalsRepository';

const repo = new GoalsRepository()
</script>

<template>
    <h1>Goals</h1>

    <p>
        Goals are the desired outcomes and needs of an organization for which a
        system must satisfy.
    </p>

    <PegsCards :repo="repo" />
</template>