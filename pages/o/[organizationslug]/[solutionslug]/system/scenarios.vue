<script lang="ts" setup>
import { ReqType, Scenario, UseCase, UserStory } from '#shared/domain'

useHead({ title: 'Scenarios' })
definePageMeta({ name: 'Scenarios', middleware: 'auth' })

const { solutionslug: solutionSlug, organizationslug: organizationSlug } = useRoute('Scenarios').params

const tabItems = ref([
    { label: 'User Stories', slot: 'user-stories' },
    { label: 'Use Cases', slot: 'use-cases' }
])
</script>

<template>
    <div>
        <h1>S.4 Scenarios</h1>

        <p>{{ Scenario.description }}</p>

        <UTabs :items="tabItems">
            <template #user-stories>
                <p class="whitespace-pre-wrap mb-8">
                    {{ UserStory.description }}
                </p>

                <XWorkflow
                    :organization-slug="organizationSlug"
                    :req-type="ReqType.USER_STORY"
                    :solution-slug="solutionSlug"
                />
            </template>
            <template #use-cases>
                <p class="m-8">
                    {{ UseCase.description }}
                </p>

                <UAlert
                    color="warning"
                    title="This section is currently disabled until Use Case Trigger events can be defined"
                />

                <!-- <XWorkflow :organization-slug="organizationSlug" :req-type="ReqType.USE_CASE"
                    :solution-slug="solutionSlug" /> -->
            </template>
        </UTabs>
    </div>
</template>
