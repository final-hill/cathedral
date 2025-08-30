<template>
    <li class="main-step-item">
        <UInput
            :ref="(el) => emit('set-step-ref', `main-step-${props.step.id}`, el)"
            v-model="stepDescription"
            placeholder="Enter step description..."
            :disabled="disabled"
            class="step-input"
            @keydown="(event: KeyboardEvent) => emit('step-keydown', event, props.step)"
        />
        <div class="step-actions">
            <UButton
                v-if="!step.parentStepId"
                size="xs"
                color="primary"
                variant="ghost"
                icon="i-lucide-git-branch"
                :disabled="disabled"
                title="Add extension for this step"
                @click="$emit('add-extension', step.id)"
            >
                Add Extension
            </UButton>
            <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :disabled="disabled"
                @click="$emit('remove-step', step.id)"
            />
        </div>

        <!-- Recursive nested children -->
        <ol
            v-if="step.children.length > 0"
            class="nested-children"
        >
            <StepItem
                v-for="childStep in step.children"
                :key="childStep.id"
                :step="childStep"
                :disabled="disabled"
                @step-update="emit('step-update')"
                @step-keydown="(event, step) => emit('step-keydown', event, step)"
                @remove-step="(stepId) => emit('remove-step', stepId)"
                @add-extension="(stepId) => emit('add-extension', stepId)"
                @set-step-ref="(key, el) => emit('set-step-ref', key, el)"
                @update-step-description="(stepId, description) => emit('update-step-description', stepId, description)"
            />
        </ol>
    </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NestedStep {
    id: string
    description: string
    parentStepId?: string
    order: number
    children: NestedStep[]
}

const props = defineProps<{
    step: NestedStep
    disabled?: boolean
}>(),
    emit = defineEmits<{
        'step-update': []
        'step-keydown': [event: KeyboardEvent, step: NestedStep]
        'remove-step': [stepId: string]
        'add-extension': [stepId: string]
        'set-step-ref': [key: string, el: ComponentPublicInstance | Element | null]
        'update-step-description': [stepId: string, description: string]
    }>(),
    stepDescription = computed({
        get() {
            return props.step.description
        },
        set(value: string) {
            emit('update-step-description', props.step.id, value)
            emit('step-update')
        }
    })
</script>

<style scoped>
/* Native ordered list approach with CSS counters */
.nested-children {
  counter-reset: section;
  padding-left: 2rem; /* Add indentation for nested lists */
  list-style: none;
  margin-top: 0.5rem;
}

.main-step-item {
  display: grid;
  grid-template-columns: auto 1fr auto; /* Step number, input, actions */
  grid-template-areas:
    "number input actions"
    "children children children"; /* Children span full width on second row */
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--ui-bg-muted);
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--ui-border);
  align-items: center; /* Center align the input and actions */
}

.main-step-item .step-input {
  grid-area: input;
}

.main-step-item .step-actions {
  grid-area: actions;
}

.main-step-item .nested-children {
  grid-area: children;
  width: 100%;
}

.main-step-item::before {
  grid-area: number;
  counter-increment: section;
  content: counters(section, ".") ". ";
  font-weight: 600;
  color: var(--ui-primary);
  background: var(--ui-color-primary-50);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  min-width: 3rem;
  text-align: center;
}

/* Input and button styling */
.step-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.main-step-item:hover .step-actions {
  opacity: 1;
}

/* Responsive design */
@media (max-width: 640px) {
  .main-step-item {
    flex-direction: column;
    align-items: stretch;
  }

  .step-actions {
    justify-content: flex-end;
    opacity: 1;
  }
}

/* Dark mode support */
.dark .main-step-item {
  background: var(--ui-bg-elevated);
  border-color: var(--ui-border-accented);
}

.dark .main-step-item::before {
  background: var(--ui-color-primary-900);
  color: var(--ui-color-primary-100);
}
</style>
