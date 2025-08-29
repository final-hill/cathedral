<template>
    <li class="extension-step-item">
        <UInput
            :ref="(el) => emit('set-step-ref', `ext-${props.groupKey}-${props.step.id}`, el)"
            v-model="stepDescription"
            placeholder="Enter extension step..."
            :disabled="disabled"
            class="step-input"
            @keydown="(event: KeyboardEvent) => emit('step-keydown', event, props.step)"
        />
        <div class="step-actions">
            <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :disabled="disabled"
                @click="$emit('remove-step', step.id)"
            />
        </div>
    </li>

    <!-- Recursive nested extension children -->
    <li v-if="step.children.length > 0">
        <ol>
            <ExtensionStepItem
                v-for="childStep in step.children"
                :key="childStep.id"
                :step="childStep"
                :group-key="props.groupKey"
                :disabled="disabled"
                @step-update="emit('step-update')"
                @step-keydown="(event, step) => emit('step-keydown', event, step)"
                @remove-step="(stepId) => emit('remove-step', stepId)"
                @set-step-ref="(key, el) => emit('set-step-ref', key, el)"
                @update-step-description="(stepId, description) => emit('update-step-description', stepId, description)"
            />
        </ol>
    </li>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { computed } from 'vue'

interface ExtensionStep {
    id: string
    description: string
    parentStepId?: string
    order: number
    extensionGroupKey: string
    children: ExtensionStep[]
}

const props = defineProps<{
    step: ExtensionStep
    groupKey: string
    disabled?: boolean
}>(),
    emit = defineEmits<{
        'step-update': []
        'step-keydown': [event: KeyboardEvent, step: ExtensionStep]
        'remove-step': [stepId: string]
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
.extension-step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--ui-bg);
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ui-border);
}

.extension-step-item::before {
  counter-increment: extension;
  content: counters(extension, ".") ". ";
  font-weight: 600;
  color: var(--ui-success);
  background: var(--ui-color-success-50);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  min-width: 3rem;
  text-align: center;
}

/* Input and button styling */
.step-input {
  flex: 1;
}

.step-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.extension-step-item:hover .step-actions {
  opacity: 1;
}

/* Nested extension children styling */
ol {
  counter-reset: extension;
  padding-left: 2rem; /* Add indentation for nested lists */
  list-style: none;
  margin-top: 0.5rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .extension-step-item {
    flex-direction: column;
    align-items: stretch;
  }

  .step-actions {
    justify-content: flex-end;
    opacity: 1;
  }
}

/* Dark mode support */
.dark .extension-step-item {
  background: var(--ui-bg-elevated);
  border-color: var(--ui-border-accented);
}

.dark .extension-step-item::before {
  background: var(--ui-color-success-900);
  color: var(--ui-color-success-100);
}
</style>
