<script setup lang="ts">
import { GoalsRepository } from '~/data/GoalsRepository';

const route = useRoute(),
    repo = new GoalsRepository(),
    goals = await repo.getBySlug(route.path.split('/')[2])!,
    { objective, situation, outcomes } = goals;

useHead({ title: 'Rationale' })

const updateSituation = (e: Event) => {
    const txtSituation = e.target as HTMLTextAreaElement
    goals.situation = txtSituation.value.trim()
    repo.update(goals)
}

const updateObjective = (e: Event) => {
    const txtObjective = e.target as HTMLTextAreaElement
    goals.objective = txtObjective.value.trim()
    repo.update(goals)
}

const updateOutcomes = (e: Event) => {
    const txtOutcomes = e.target as HTMLTextAreaElement
    goals.outcomes = txtOutcomes.value.trim()
    repo.update(goals)
}
</script>

<template>
    <form id="frmRationale" autocomplete="off">
        <h3>Situation</h3>
        <p>
            The situation is the current state of affairs that need to be addressed
            by a system created by a project.
        </p>
        <textarea name="situation" @change="updateSituation">{{ situation }}</textarea>

        <h3>Objective</h3>
        <p>
            The objective is the reason for building a system and the organization context
            in which it will be used.
        </p>
        <textarea name="objective" @change="updateObjective">{{ objective }}</textarea>

        <h3>Outcomes</h3>
        <p>
            Outcomes are the results of the project that will be achieved by the system.
        </p>
        <textarea name="outcomes" @change="updateOutcomes">{{ outcomes }}</textarea>
    </form>
</template>

<style scoped>
textarea {
    width: 100%;
    height: 200px;
}
</style>