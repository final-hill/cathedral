<script lang="ts" setup>
import type { Justification } from '~/server/domain/Justification.js'

useHead({ title: 'Rationale' })
definePageMeta({ name: 'Rationale' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Rationale').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solutions`, {
        query: {
            slug: solutionslug,
            organizationSlug: organizationslug
        }
    }),
    solutionId = solutions.value?.[0].id;

if (getSolutionError.value)
    $eventBus.$emit('page-error', getSolutionError.value);

const [
    { data: visionJustifications, error: getVisionError },
    { data: missionJustifications, error: getMissionError },
    { data: situationJustifications, error: getSituationError },
    { data: objectiveJustifications, error: getObjectiveError }
] = await Promise.all([
    useFetch<Justification[]>(`/api/justifications`, { query: { name: 'Vision', solutionId } }),
    useFetch<Justification[]>(`/api/justifications`, { query: { name: 'Mission', solutionId } }),
    useFetch<Justification[]>(`/api/justifications`, { query: { name: 'Situation', solutionId } }),
    useFetch<Justification[]>(`/api/justifications`, { query: { name: 'Objective', solutionId } })
]);

if (getVisionError.value)
    $eventBus.$emit('page-error', getVisionError.value);
if (getMissionError.value)
    $eventBus.$emit('page-error', getMissionError.value);
if (getSituationError.value)
    $eventBus.$emit('page-error', getSituationError.value);
if (getObjectiveError.value)
    $eventBus.$emit('page-error', getObjectiveError.value);

const visionStatement = ref(visionJustifications.value?.[0].statement!),
    missionStatement = ref(missionJustifications.value?.[0].statement!),
    situationStatement = ref(situationJustifications.value?.[0].statement!),
    objectiveStatement = ref(objectiveJustifications.value?.[0].statement!);

const fieldTriple: [Ref<string>, Justification, string][] = [
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
        }).catch((e) => $eventBus.$emit('page-error', e));
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