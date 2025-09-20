<script lang="ts" setup>
import * as req from '#shared/domain/requirements'
import { ReqType } from '#shared/domain'
import type { PegsCard } from '#shared/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute(),
    { solutionslug, organizationslug, pegs } = route.params as {
        solutionslug: string
        organizationslug: string
        pegs: 'project' | 'environment' | 'goals' | 'system'
    },
    title = deSlugify(pegs) as keyof typeof req,
    RequirementSchema = req[title]

useHead({ title })

const pegsMap: Record<string, PegsCard[]> = {
    project: [
        {
            label: 'Roles & Personnel',
            icon: 'i-lucide-users',
            reqId: req.Person.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/project/person`
        },
        {
            label: 'Imposed technical choices',
            icon: 'i-lucide-cpu',
            reqId: 'P.2',
            disabled: true
        },
        {
            label: 'Schedule and milestones',
            icon: 'i-lucide-calendar',
            reqId: 'P.3',
            disabled: true,
            minActiveReqTypes: [ReqType.MILESTONE]
        },
        {
            label: 'Tasks and deliverables',
            icon: 'i-lucide-clipboard-list',
            reqId: 'P.4',
            disabled: true,
            minActiveReqTypes: [ReqType.TASK]
        },
        {
            label: 'Required technology elements',
            icon: 'i-lucide-cog',
            reqId: 'P.5',
            disabled: true
        },
        {
            label: 'Risk and mitigation analysis',
            icon: 'i-lucide-shield-alert',
            reqId: 'P.6',
            disabled: true
        },
        {
            label: 'Requirements Process and Report',
            icon: 'i-lucide-file-text',
            reqId: req.ParsedRequirements.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/project/parsed-requirements`
        }
    ],
    environment: [
        {
            label: 'Glossary',
            icon: 'i-lucide-book',
            reqId: req.GlossaryTerm.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/environment/glossary-term`
        },
        {
            label: 'Environment Components',
            icon: 'i-lucide-blocks',
            reqId: req.EnvironmentComponent.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/environment/environment-component`
        },
        {
            label: 'Constraints',
            icon: 'i-lucide-link',
            reqId: req.Constraint.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/environment/constraint`,
            minActiveReqTypes: [ReqType.CONSTRAINT]
        },
        {
            label: 'Assumptions',
            icon: 'i-lucide-sunrise',
            reqId: req.Assumption.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/environment/assumption`
        },
        {
            label: 'Effects',
            icon: 'i-lucide-cloud-lightning',
            reqId: req.Effect.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/environment/effect`
        },
        {
            label: 'Invariants',
            icon: 'i-lucide-lock-keyhole',
            reqId: req.Invariant.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/environment/invariant`
        }
    ],
    goals: [
        {
            label: 'Context and Objective',
            icon: 'i-lucide-target',
            reqId: req.ContextAndObjective.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/goals/context-and-objective`,
            minActiveReqTypes: [ReqType.CONTEXT_AND_OBJECTIVE]
        },
        {
            label: 'Situation',
            icon: 'i-lucide-search',
            reqId: req.Obstacle.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/goals/obstacle`
        },
        {
            label: 'Outcomes',
            icon: 'i-lucide-circle-check-big',
            reqId: req.Outcome.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/goals/outcome`,
            minActiveReqTypes: [ReqType.OUTCOME]
        },
        {
            label: 'Functionality',
            icon: 'i-lucide-settings',
            reqId: req.Functionality.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/goals/functionality`
        },
        {
            label: 'Scenarios (Epics)',
            icon: 'i-lucide-briefcase',
            reqId: req.Epic.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/goals/epic`
        },
        {
            label: 'Limits',
            icon: 'i-lucide-file-warning',
            reqId: req.Limit.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/goals/limit`
        },
        {
            label: 'Stakeholders',
            icon: 'i-lucide-users',
            reqId: req.Stakeholder.innerType().shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/goals/stakeholder`,
            minActiveReqTypes: [ReqType.STAKEHOLDER]
        }
    ],
    system: [
        {
            label: 'Components',
            icon: 'i-lucide-blocks',
            reqId: req.SystemComponent.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/system/system-component`,
            minActiveReqTypes: [ReqType.SYSTEM_COMPONENT]
        },
        {
            label: 'Functional Behavior',
            icon: 'i-lucide-square-function',
            reqId: req.FunctionalBehavior.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/system/functional-behavior`,
            minActiveReqTypes: [ReqType.FUNCTIONAL_BEHAVIOR]
        },
        {
            label: 'Non-Functional Behavior',
            icon: 'i-lucide-shield-check',
            reqId: req.NonFunctionalBehavior.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/system/non-functional-behavior`
        },
        {
            label: 'Interfaces',
            icon: 'i-lucide-plug',
            reqId: 'S.3',
            path: `/o/${organizationslug}/${solutionslug}/${pegs}/interface`
        },
        {
            label: 'User Stories',
            icon: 'i-lucide-user-2',
            reqId: req.UserStory.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/system/user-story`
        },
        {
            label: 'Use Cases',
            icon: 'i-lucide-briefcase',
            reqId: req.UseCase.shape.reqIdPrefix._def.defaultValue(),
            path: `/o/${organizationslug}/${solutionslug}/system/use-case`
        },
        {
            label: 'Prioritization',
            icon: 'i-lucide-arrow-up-down',
            reqId: 'S.5',
            path: `/o/${organizationslug}/${solutionslug}/system/prioritization`
        },
        {
            label: 'Verification and acceptance criteria',
            icon: 'i-lucide-check-circle',
            reqId: 'S.6',
            disabled: true
        }
    ]
}
</script>

<template>
    <PegsLanding
        :cards="pegsMap[pegs] || []"
        :solutionslug="solutionslug"
        :organizationslug="organizationslug"
    >
        <template #header>
            <h1>{{ title }}</h1>
            <p>
                {{ RequirementSchema.description }}
            </p>
        </template>
    </PegsLanding>
</template>
