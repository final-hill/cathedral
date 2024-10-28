<script lang="ts" setup>
type JustificationViewModel = {
    id: string;
    name: string;
    description: string;
};

useHead({ title: 'Rationale' })
definePageMeta({ name: 'Rationale' })

const { $eventBus } = useNuxtApp(),
    { solutionslug, organizationslug } = useRoute('Rationale').params,
    { data: solutions, error: getSolutionError } = await useFetch(`/api/solution`, {
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
    useFetch<JustificationViewModel[]>(`/api/justification`, { query: { name: 'Vision', solutionId } }),
    useFetch<JustificationViewModel[]>(`/api/justification`, { query: { name: 'Mission', solutionId } }),
    useFetch<JustificationViewModel[]>(`/api/justification`, { query: { name: 'Situation', solutionId } }),
    useFetch<JustificationViewModel[]>(`/api/justification`, { query: { name: 'Objective', solutionId } })
]);

if (getVisionError.value)
    $eventBus.$emit('page-error', getVisionError.value);
if (getMissionError.value)
    $eventBus.$emit('page-error', getMissionError.value);
if (getSituationError.value)
    $eventBus.$emit('page-error', getSituationError.value);
if (getObjectiveError.value)
    $eventBus.$emit('page-error', getObjectiveError.value);

const visionDescription = ref(visionJustifications.value?.[0].description!),
    missionDescription = ref(missionJustifications.value?.[0].description!),
    situationDescription = ref(situationJustifications.value?.[0].description!),
    objectiveDescription = ref(objectiveJustifications.value?.[0].description!);

const fieldTriple: [Ref<string>, JustificationViewModel, string][] = [
    [visionDescription, visionJustifications.value![0], 'Vision'],
    [missionDescription, missionJustifications.value![0], 'Mission'],
    [situationDescription, situationJustifications.value![0], 'Situation'],
    [objectiveDescription, objectiveJustifications.value![0], 'Objective']
];

fieldTriple.forEach(([goalDescription, justification, _name]) => {
    watch(goalDescription, debounce(() => {
        justification.description = goalDescription.value;
        $fetch(`/api/justification/${justification.id}`, {
            method: 'PUT',
            body: {
                solutionId,
                name: justification.name,
                description: justification.description
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
            <Textarea name="vision" id="vision" class="w-full h-10rem" v-model.trim.lazy="visionDescription" />
        </div>
        <div class="field">
            <h3>Mission</h3>
            <p>
                The mission is informed by the vision and is a description of what you
                are doing to achieve the vision.
            </p>
            <Textarea name="mission" id="mission" class="w-full h-10rem" v-model.trim.lazy="missionDescription" />
        </div>
        <div class="field">
            <h3>Situation</h3>
            <p>
                The situation is the current state of affairs that need to be
                addressed by the system created by a project.
            </p>
            <Textarea name="situation" id="situation" class="w-full h-10rem" v-model.trim.lazy="situationDescription" />
        </div>
        <div class="field">
            <h3>Objective</h3>
            <p>
                The objective is the reason for building a system and the organization
                context in which it will be used.
            </p>
            <Textarea name="objective" id="objective" class="w-full h-10rem" v-model.trim.lazy="objectiveDescription" />
        </div>
    </form>
</template>