<script setup lang="ts">
import { GoalsRepository } from '~/data/GoalsRepository';

const route = useRoute(),
    repo = new GoalsRepository(),
    goals = ref(await repo.getBySlug(route.path.split('/')[2])!)
</script>

<template>
    <h2>{{ goals.name }}</h2>

    <MiniCards>
        <MiniCard :url="`/goals/${goals.id}/rationale`">
            <PhosphorIconLightbulb size="25" />
            <span>Rationale</span>
        </MiniCard>
        <MiniCard :url="`/goals/${goals.id}/functionality`">
            <PhosphorIconStairs size="25" />
            <span>Functionality</span>
        </MiniCard>
        <MiniCard :url="`/goals/${goals.id}/stakeholders`">
            <PhosphorIconUsersFour size="25" />
            <span>Stakeholders</span>
        </MiniCard>
    </MiniCards>
</template>