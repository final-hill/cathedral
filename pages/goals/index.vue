<script setup lang="ts">
import { GoalsRepository } from '~/data/GoalsRepository';

const repo = new GoalsRepository()

useHead({ title: 'Goals' })
</script>

<template>
    <p>
        Goals are the desired outcomes and needs of an organization for which a
        system must satisfy.
    </p>

    <PegsCards :repo="repo" />
</template>