<script lang="ts" setup>
import SolutionRepository from '~/data/SolutionRepository';
import GoalRepository from '~/data/GoalRepository';
import SolutionInteractor from '~/application/SolutionInteractor';
import GoalInteractor from '~/application/GoalInteractor';
import type Goal from '~/domain/Goal';

useHead({ title: 'Rationale' })
definePageMeta({ name: 'Rationale' })

const slug = useRoute().params.slug as string,
    solutionInteractor = new SolutionInteractor(new SolutionRepository()),
    goalInteractor = new GoalInteractor(new GoalRepository()),
    solution = (await solutionInteractor.getAll({ slug }))[0],
    solutionId = solution.id;

let visionGoal = (await goalInteractor.getAll({ solutionId, name: 'Vision' }))[0],
    missionGoal = (await goalInteractor.getAll({ solutionId, name: 'Mission' }))[0],
    situationGoal = (await goalInteractor.getAll({ solutionId, name: 'Situation' }))[0],
    objectiveGoal = (await goalInteractor.getAll({ solutionId, name: 'Objective' }))[0];

if (!visionGoal) {
    goalInteractor.create({ solutionId, name: 'Vision', statement: '', property: '' });
    visionGoal = (await goalInteractor.getAll({ solutionId, name: 'Vision' }))[0];
}

if (!missionGoal) {
    goalInteractor.create({ solutionId, name: 'Mission', statement: '', property: '' });
    missionGoal = (await goalInteractor.getAll({ solutionId, name: 'Mission' }))[0];
}

if (!situationGoal) {
    goalInteractor.create({ solutionId, name: 'Situation', statement: '', property: '' });
    situationGoal = (await goalInteractor.getAll({ solutionId, name: 'Situation' }))[0];
}

if (!objectiveGoal) {
    goalInteractor.create({ solutionId, name: 'Objective', statement: '', property: '' });
    objectiveGoal = (await goalInteractor.getAll({ solutionId, name: 'Objective' }))[0];
}

const visionStatement = ref(visionGoal.statement),
    missionStatement = ref(missionGoal.statement),
    situationStatement = ref(situationGoal.statement),
    objectiveStatement = ref(objectiveGoal.statement)

const fieldTriple: [Ref<string>, Goal, string][] = [
    [visionStatement, visionGoal, 'Vision'],
    [missionStatement, missionGoal, 'Mission'],
    [situationStatement, situationGoal, 'Situation'],
    [objectiveStatement, objectiveGoal, 'Objective']
];

fieldTriple.forEach(([goalStatement, goal, _name]) => {
    watch(goalStatement, () => {
        goal.statement = goalStatement.value;
        goalInteractor.update(goal);
    });
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