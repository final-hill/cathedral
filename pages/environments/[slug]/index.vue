<script setup lang="ts">
import { EnvironmentRepository } from '~/data/EnvironmentRepository'

const route = useRoute(),
    repo = new EnvironmentRepository(),
    environment = ref(await repo.getBySlug(route.path.split('/')[2])!)

useHead({ title: environment.value.name })
</script>

<template>
    <MiniCards>
        <MiniCard :url="`/environments/${environment.id}/glossary`">
            <PhosphorIconBookOpenText size="25" />
            <span>Glossary</span>
        </MiniCard>
    </MiniCards>
</template>