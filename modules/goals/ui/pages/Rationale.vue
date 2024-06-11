<script lang="ts" setup>
import GoalsRepository from '../../data/GoalsRepository';
import SolutionRepository from '~/modules/solution/data/SolutionRepository';
import GoalRepository from '../../data/GoalRepository';
import GetSolutionBySlugUseCase from '~/modules/solution/application/GetSolutionBySlugUseCase';
import GetGoalsBySolutionIdUseCase from '../../application/GetGoalsBySolutionIdUseCase';
import GetRationaleUseCase from '../../application/GetRationaleUseCase';
import UpdateRationaleUseCase from '../../application/UpdateRationaleUseCase';

useHead({
    title: 'Rationale'
})

const router = useRouter(),
    route = useRoute(),
    slug = route.params.solutionSlug as string,

    goalsRepository = new GoalsRepository(),
    solutionRepository = new SolutionRepository(),
    goalRepository = new GoalRepository(),

    getSolutionBySlugUse = new GetSolutionBySlugUseCase(solutionRepository),
    getGoalsBySolutionIdUseCase = new GetGoalsBySolutionIdUseCase(goalsRepository),
    getRationaleUseCase = new GetRationaleUseCase(goalRepository),
    updateRationaleUseCase = new UpdateRationaleUseCase(goalRepository),

    solution = await getSolutionBySlugUse.execute(slug),
    goals = solution?.id && await getGoalsBySolutionIdUseCase.execute(solution.id),
    rationale = goals && await getRationaleUseCase.execute(goals.id),

    vision = ref(goals && (rationale?.vision || '')),
    mission = ref(goals && (rationale?.mission || '')),
    situation = ref(goals && (rationale?.situation || '')),
    objective = ref(goals && (rationale?.objective || ''))

if (!solution) {
    router.push({ name: 'Solutions' });
} else {
    if (!goals)
        router.push({ name: 'Goals', params: { solutionSlug: slug } });
}

watch([vision, mission, situation, objective], async (newValues, _oldValues) => {
    await updateRationaleUseCase.execute({
        goalsId: goals!.id,
        visionStatement: newValues[0]!,
        missionStatement: newValues[1]!,
        situationStatement: newValues[2]!,
        objectiveStatement: newValues[3]!
    })
})
</script>

<template>
    <form autocomplete="off">
        <div class="field">
            <h3>Vision</h3>
            <p>
                A vision is a view of how the world should be and what your place
                is in it. It is not a wish, but a goal.
            </p>
            <Textarea name="vision" id="vision" class="w-full h-10rem" v-model.trim.lazy="vision" />
        </div>
        <div class="field">
            <h3>Mission</h3>
            <p>
                The mission is informed by the vision and is a statement of what you
                are doing to achieve the vision.
            </p>
            <Textarea name="mission" id="mission" class="w-full h-10rem" v-model.trim.lazy="mission" />
        </div>
        <div class="field">
            <h3>Situation</h3>
            <p>
                The situation is the current state of affairs that need to be
                addressed by the system created by a project.
            </p>
            <Textarea name="situation" id="situation" class="w-full h-10rem" v-model.trim.lazy="situation" />
        </div>
        <div class="field">
            <h3>Objective</h3>
            <p>
                The objective is the reason for building a system and the organization
                context in which it will be used.
            </p>
            <Textarea name="objective" id="objective" class="w-full h-10rem" v-model.trim.lazy="objective" />
        </div>
    </form>
</template>