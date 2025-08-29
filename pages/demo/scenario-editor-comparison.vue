<template>
    <div class="container mx-auto py-8 px-4">
        <div class="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 class="text-2xl font-bold text-highlighted mb-4">
                    Scenario Steps Editor
                </h1>
                <p class="text-muted">
                    Hierarchical editor that separates Main Success Scenario from Extensions using proper HTML ordered lists with CSS counters.
                    Supports keyboard shortcuts and proper Use Case extension patterns.
                </p>
            </div>

            <!-- Hierarchical Editor -->
            <UCard>
                <template #header>
                    <h2 class="text-lg font-semibold">
                        Composite Scenario Steps Editor
                    </h2>
                    <p class="text-sm text-muted">
                        Testing the full ScenarioStepsEditor component with "Add Extension" functionality.
                        Enter <UKbd>Enter</UKbd> to add new steps,
                        <UKbd>Tab</UKbd> to indent extension steps,
                        <UKbd>Shift+Tab</UKbd> to outdent.
                    </p>
                </template>

                <!-- Using Composite Component -->
                <ScenarioStepsEditor
                    v-model="hierarchicalCombinedSteps"
                    label="Combined Scenario Steps"
                    @validation-ready="onCompositeValidationReady"
                />

                <template #footer>
                    <div class="space-y-2">
                        <div class="text-xs text-muted">
                            <strong>Features:</strong>
                            <ul class="list-disc list-inside mt-1 space-y-1">
                                <li>Integrated Main Success Scenario and Extensions in one component</li>
                                <li>"Add Extension" buttons on top-level main scenario steps</li>
                                <li>Automatic extension naming (3a, 4a, etc.) based on main step numbers</li>
                                <li>Smart Data architecture using Maps for clean state management</li>
                                <li>Tab/Shift+Tab for indenting sub-steps with focus preservation</li>
                                <li>Enter key automatically focuses new steps</li>
                                <li>Proper event handling between Main Success and Extensions</li>
                                <li>Follows Cockburn/Jacobson Use Case patterns exactly</li>
                            </ul>
                        </div>
                    </div>
                </template>
            </UCard>

            <!-- Sample Use Case Structure -->
            <UCard>
                <template #header>
                    <h2 class="text-lg font-semibold">
                        Use Case Extension Pattern Example
                    </h2>
                    <p class="text-sm text-muted">
                        How extensions reference main scenario steps in proper Use Case notation.
                    </p>
                </template>

                <div class="space-y-4">
                    <div>
                        <h3 class="font-medium text-highlighted mb-2">
                            Main Success Scenario:
                        </h3>
                        <ol class="space-y-1 text-sm">
                            <li>1. Customer provides identification</li>
                            <li>2. System validates customer credentials</li>
                            <li>3. System displays account information</li>
                            <li>4. Customer selects account action</li>
                        </ol>
                    </div>

                    <div>
                        <h3 class="font-medium text-highlighted mb-2">
                            Extensions:
                        </h3>
                        <div class="space-y-2 text-sm">
                            <div>
                                <strong>2a.</strong> Invalid credentials provided:
                                <div class="ml-4">
                                    <div>2a.1. System displays error message</div>
                                    <div>2a.2. System prompts for valid credentials</div>
                                    <div>2a.3. Return to step 2</div>
                                </div>
                            </div>
                            <div>
                                <strong>2b.</strong> Account locked:
                                <div class="ml-4">
                                    <div>2b.1. System displays account locked message</div>
                                    <div>2b.2. System provides contact information</div>
                                    <div>2b.3. Use case ends</div>
                                </div>
                            </div>
                            <div>
                                <strong>4a.</strong> Customer requests balance:
                                <div class="ml-4">
                                    <div>4a.1. System displays current balance</div>
                                    <div>4a.2. Return to step 4</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Data Display -->
            <UCard>
                <template #header>
                    <h2 class="text-lg font-semibold">
                        Data Comparison
                    </h2>
                </template>

                <div class="max-w-2xl mx-auto">
                    <h3 class="font-medium mb-2">
                        Current Composite Editor Data:
                    </h3>
                    <div class="space-y-2">
                        <div>
                            <strong class="text-sm">Combined Steps (Main + Extensions):</strong>
                            <pre class="text-xs bg-elevated p-3 rounded border overflow-auto max-h-32">{{ JSON.stringify(hierarchicalCombinedSteps, null, 2) }}</pre>
                        </div>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ScenarioStepReferenceType } from '~/shared/domain/requirements/EntityReferences'
import { ReqType } from '~/shared/domain/requirements/ReqType'
import { ScenarioStepTypeEnum } from '~/shared/domain/requirements/ScenarioStepTypeEnum'
import ScenarioStepsEditor from '~/components/ScenarioStepsEditor.vue'

definePageMeta({
    title: 'Scenario Steps Editor Comparison'
})

// State for the composite editor
const hierarchicalCombinedSteps = ref<ScenarioStepReferenceType[]>([])

// Validation state
let _compositeValidate: (() => Promise<{ isValid: boolean, message?: string }>) | null = null

function onCompositeValidationReady(validateFn: () => Promise<{ isValid: boolean, message?: string }>) {
    _compositeValidate = validateFn
}

// Initialize with some sample data for comparison
onMounted(() => {
    // Sample data showing the insurance claim structure with hierarchical parent-child relationships
    // Using the new parent-child model with explicit ordering
    const mainStepData = [
            {
                id: '1',
                name: 'A reporting party who is aware of the event registers a loss to the insurance company.',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: undefined, // Top-level step
                order: 0 // First step
            },
            {
                id: '2',
                name: 'A clerk receives and assigns the claim to a claims agent',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: undefined, // Top-level step
                order: 1 // Second step
            },
            {
                id: '3',
                name: 'The assigned claims adjuster:',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: undefined, // Top-level step
                order: 2 // Third step
            },
            {
                id: '4',
                name: 'Conducts an investigation',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: '3', // Child of step 3
                order: 0 // First child of step 3
            },
            {
                id: '5',
                name: 'Evaluates damages.',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: '3', // Child of step 3
                order: 1 // Second child of step 3
            },
            {
                id: '6',
                name: 'Sets reserves.',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: '3', // Child of step 3
                order: 2 // Third child of step 3
            },
            {
                id: '7',
                name: 'Negotiates the claim.',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: '3', // Child of step 3
                order: 3 // Fourth child of step 3
            },
            {
                id: '8',
                name: 'Resolves the claim and closes it',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: '3', // Child of step 3
                order: 4 // Fifth child of step 3
            }
        ],

        extensionData = [
        // Extensions using simple parent-child structure for hierarchy
            {
                id: '9',
                name: 'Insurance company requests missing information.',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: undefined, // Top-level extension
                order: 0 // First extension step
            },
            {
                id: '10',
                name: 'Claimant supplies missing information.',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: undefined, // Top-level extension
                order: 1 // Second extension step
            },
            {
                id: '11',
                name: 'Claimant does not supply information by deadline:',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: '10', // Child of "Claimant supplies missing information"
                order: 0 // First child of step 10
            },
            {
                id: '12',
                name: 'Adjuster closes claim',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: '11', // Child of "Claimant does not supply information by deadline"
                order: 0 // First child of step 11
            },
            {
                id: '13',
                name: 'Insurance company declines claim, notifies claimant, updates claim, closes claim',
                reqType: ReqType.SCENARIO_STEP,
                stepType: ScenarioStepTypeEnum.Action,
                parentStepId: undefined, // Top-level extension
                order: 2 // Third extension step
            }
        ]

    // Initialize with combined data for the composite editor
    hierarchicalCombinedSteps.value = [...mainStepData, ...extensionData]
})
</script>
