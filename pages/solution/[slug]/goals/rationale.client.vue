<script lang="ts" setup>
import debounce from '~/lib/debounce';
import Goal from '~/server/domain/Goal';
import type { Properties } from '~/server/domain/Properties';

useHead({ title: 'Rationale' })
definePageMeta({ name: 'Rationale' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solutionId = solutions.value?.[0].id;

let { data: visionGoals, refresh: refreshVision } = useFetch(`/api/goals?solutionId=${solutionId}&name=Vision`),
    { data: missionGoals, refresh: refreshMission } = useFetch(`/api/goals?solutionId=${solutionId}&name=Mission`),
    { data: situationGoals, refresh: refreshSituation } = useFetch(`/api/goals?solutionId=${solutionId}&name=Situation`),
    { data: objectiveGoals, refresh: refreshObjective } = useFetch(`/api/goals?solutionId=${solutionId}&name=Objective`)

if (!visionGoals.value?.length) {
    await useFetch(`/api/goals`, {
        method: 'POST',
        body: { solutionId, name: 'Vision', statement: '' }
    });
    await refreshVision();
}

if (!missionGoals.value?.length) {
    await useFetch(`/api/goals`, {
        method: 'POST',
        body: { solutionId, name: 'Mission', statement: '' }
    });
    await refreshMission();
}

if (!situationGoals.value?.length) {
    await useFetch(`/api/goals`, {
        method: 'POST',
        body: { solutionId, name: 'Situation', statement: '' }
    });
    await refreshSituation();
}

if (!objectiveGoals.value?.length) {
    await useFetch(`/api/goals`, {
        method: 'POST',
        body: { solutionId, name: 'Objective', statement: '' }
    });
    await refreshObjective();
}

const visionStatement = ref(visionGoals.value?.[0].statement!),
    missionStatement = ref(missionGoals.value?.[0].statement!),
    situationStatement = ref(situationGoals.value?.[0].statement!),
    objectiveStatement = ref(objectiveGoals.value?.[0].statement!);

const fieldTriple: [Ref<string>, Properties<Goal>, string][] = [
    [visionStatement, visionGoals.value![0], 'Vision'],
    [missionStatement, missionGoals.value![0], 'Mission'],
    [situationStatement, situationGoals.value![0], 'Situation'],
    [objectiveStatement, objectiveGoals.value![0], 'Objective']
];

fieldTriple.forEach(([goalStatement, goal, _name]) => {
    watch(goalStatement, debounce(() => {
        goal.statement = goalStatement.value;
        $fetch(`/api/goals/${goal.id}`, {
            method: 'PUT',
            body: goal
        });
    }, 500));
});
</script>

<template>
    <form autocomplete="off">
        <div class="field">
            <h3>Vision</h3>
            <p>
                A vision is a view of how the world should be and what your place
                is in it. It is not a wish, but a goal.
            </p>
            <Textarea name="vision" id="vision" class="w-full h-10rem" v-model.trim.lazy="visionStatement" />
        </div>
        <div class="field">
            <h3>Mission</h3>
            <p>
                The mission is informed by the vision and is a statement of what you
                are doing to achieve the vision.
            </p>
            <Textarea name="mission" id="mission" class="w-full h-10rem" v-model.trim.lazy="missionStatement" />
        </div>
        <div class="field">
            <h3>Situation</h3>
            <p>
                The situation is the current state of affairs that need to be
                addressed by the system created by a project.
            </p>
            <Textarea name="situation" id="situation" class="w-full h-10rem" v-model.trim.lazy="situationStatement" />
        </div>
        <div class="field">
            <h3>Objective</h3>
            <p>
                The objective is the reason for building a system and the organization
                context in which it will be used.
            </p>
            <Textarea name="objective" id="objective" class="w-full h-10rem" v-model.trim.lazy="objectiveStatement" />
        </div>
    </form>
</template>