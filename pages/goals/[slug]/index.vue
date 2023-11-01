<script setup lang="ts">
import { GoalsRepository } from '~/data/GoalsRepository';

const route = useRoute(),
    repo = new GoalsRepository(),
    goals = ref(await repo.getBySlug(route.path.split('/')[2])!)

useHead({ title: goals.value.name })
</script>

<template>
    <MiniCards>
        <MiniCard :url="`/goals/${goals.slug()}/rationale`">
            <PhosphorIconLightbulb size="25" />
            <span>Rationale</span>
        </MiniCard>
        <MiniCard :url="`/goals/${goals.slug()}/functionality`">
            <PhosphorIconStairs size="25" />
            <span>Functionality</span>
        </MiniCard>
        <MiniCard :url="`/goals/${goals.slug()}/stakeholders`">
            <PhosphorIconUsersFour size="25" />
            <span>Stakeholders</span>
        </MiniCard>
    </MiniCards>
</template>