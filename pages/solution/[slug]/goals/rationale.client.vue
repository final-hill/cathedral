<script lang="ts" setup>
import debounce from '~/lib/debounce';

useHead({ title: 'Rationale' })
definePageMeta({ name: 'Rationale' })

const slug = useRoute().params.slug as string,
    { data: solutions } = await useFetch(`/api/solutions?slug=${slug}`),
    solutionId = solutions.value?.[0].id;

type JustificationModel = {
    id: string;
    name: string;
    statement: string;
}

const [
    { data: visionJustifications, refresh: refreshVision },
    { data: missionJustifications, refresh: refreshMission },
    { data: situationJustifications, refresh: refreshSituation },
    { data: objectiveJustifications, refresh: refreshObjective }
] = await Promise.all([
    useFetch(`/api/justifications?solutionId=${solutionId}&name=Vision`),
    useFetch(`/api/justifications?solutionId=${solutionId}&name=Mission`),
    useFetch(`/api/justifications?solutionId=${solutionId}&name=Situation`),
    useFetch(`/api/justifications?solutionId=${solutionId}&name=Objective`)
]);

if (!visionJustifications.value?.length) {
    useFetch(`/api/justifications`, {
        method: 'POST',
        body: { solutionId, name: 'Vision', statement: '' }
    });
}

if (!missionJustifications.value?.length) {
    useFetch(`/api/justifications`, {
        method: 'POST',
        body: { solutionId, name: 'Mission', statement: '' }
    });
}

if (!situationJustifications.value?.length) {
    useFetch(`/api/justifications`, {
        method: 'POST',
        body: { solutionId, name: 'Situation', statement: '' }
    });
}

if (!objectiveJustifications.value?.length) {
    useFetch(`/api/justifications`, {
        method: 'POST',
        body: { solutionId, name: 'Objective', statement: '' }
    });
}

await Promise.all([
    refreshVision(),
    refreshMission(),
    refreshSituation(),
    refreshObjective()
]);

const visionStatement = ref(visionJustifications.value?.[0].statement!),
    missionStatement = ref(missionJustifications.value?.[0].statement!),
    situationStatement = ref(situationJustifications.value?.[0].statement!),
    objectiveStatement = ref(objectiveJustifications.value?.[0].statement!);

const fieldTriple: [Ref<string>, JustificationModel, string][] = [
    [visionStatement, visionJustifications.value![0], 'Vision'],
    [missionStatement, missionJustifications.value![0], 'Mission'],
    [situationStatement, situationJustifications.value![0], 'Situation'],
    [objectiveStatement, objectiveJustifications.value![0], 'Objective']
];

fieldTriple.forEach(([goalStatement, justification, _name]) => {
    watch(goalStatement, debounce(() => {
        justification.statement = goalStatement.value;
        $fetch(`/api/justifications/${justification.id}`, {
            method: 'PUT',
            body: {
                solutionId,
                name: justification.name,
                statement: justification.statement
            }
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