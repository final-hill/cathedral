<template>
    <div class="border border-default rounded-lg p-4 min-h-[120px] scenario-editor">
        <TiptapEditorContent
            :editor="editor"
            class="focus:outline-none"
            :class="{ 'opacity-50 pointer-events-none': disabled }"
        />
    </div>
</template>

<script setup lang="ts">
import type { ScenarioStepReferenceType, ScenarioStepSuggestionType } from '~/shared/domain/requirements/EntityReferences'

// Union type for internal component state - can handle both persisted and new steps
type ScenarioStepItem = ScenarioStepReferenceType | ScenarioStepSuggestionType

// Type guard to check if a step has an ID (is persisted)
const isPersistedStep = (step: ScenarioStepItem): step is ScenarioStepReferenceType => {
        return 'id' in step
    },
    props = defineProps<{
        modelValue?: ScenarioStepReferenceType[]
        label: string
        disabled?: boolean
    }>(),
    emit = defineEmits<{
        'update:modelValue': [value: ScenarioStepReferenceType[]]
        'validation-ready': [validateFn: () => Promise<{ isValid: boolean, message?: string }>]
    }>(),
    // Internal state tracks mix of persisted and new steps
    internalSteps = ref<ScenarioStepItem[]>(props.modelValue || []),
    // Create editor with restricted extensions - only ordered lists
    editor = useEditor({
        content: convertStepsToHtml(internalSteps.value),
        editable: !props.disabled,
        extensions: [
            TiptapDocument,
            TiptapParagraph,
            TiptapText,
            TiptapOrderedList,
            TiptapListItem,
            TiptapHardBreak,
            TiptapHistory // For undo/redo
        ],
        onCreate: ({ editor }) => {
            // Ensure we always start with an ordered list
            if (!editor.isActive('orderedList'))
                editor.chain().focus().toggleOrderedList().run()
        },
        onUpdate: ({ editor }) => {
            // Ensure content stays in a list
            nextTick(() => {
                if (!editor.isActive('orderedList') && !editor.isEmpty)
                    editor.chain().focus().toggleOrderedList().run()
            })
        },
        editorProps: {
            attributes: {
                class: 'scenario-steps-content'
            },
            // Force plain text pasting by transforming any pasted content
            transformPastedText(text, _plain, _view) {
                return text
            },
            transformPastedHTML(html, _view) {
                // Convert HTML to plain text using innerText for better handling of
                // line breaks (<br> elements) and hidden elements
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = html
                return tempDiv.innerText
            },
            // Additional paste handling to ensure list structure
            handlePaste(view, event, _slice) {
                const plainText = event.clipboardData?.getData('text/plain') || ''

                if (plainText) {
                    event.preventDefault()

                    const lines = plainText.split(/\r?\n/).filter(line => line.trim())

                    if (lines.length > 0) {
                        // Insert each line as a separate list item
                        const { from, to } = view.state.selection,
                            transaction = view.state.tr

                        // Delete selected content if any
                        if (from !== to)
                            transaction.deleteRange(from, to)

                        // Insert lines as list items
                        lines.forEach((line, index) => {
                            if (index === 0) {
                                // Replace current selection with first line
                                transaction.insertText(line.trim(), transaction.selection.from)
                            } else {
                                // Add new list items for additional lines
                                const listItem = view.state.schema.nodes.listItem.create(null, [
                                    view.state.schema.nodes.paragraph.create(null, [
                                        view.state.schema.text(line.trim())
                                    ])
                                ])
                                transaction.insert(transaction.selection.to, listItem)
                            }
                        })

                        view.dispatch(transaction)
                        return true // Indicate we handled the paste
                    }
                }

                return false // Allow default paste handling
            }
        }
    })

// Watch for external changes and sync with internal state
watch(() => props.modelValue, (newSteps) => {
    internalSteps.value = newSteps || []

    if (editor.value && !editor.value.isFocused) {
        const newHtml = convertStepsToHtml(internalSteps.value)
        if (editor.value.getHTML() !== newHtml)
            editor.value.commands.setContent(newHtml)
    }
})

watch(() => props.disabled, (disabled) => {
    if (editor.value)
        editor.value.setEditable(!disabled)
})

// Convert our step data to HTML ordered list
function convertStepsToHtml(steps: ScenarioStepItem[]): string {
    if (steps.length === 0)
        return '<ol><li><p>Click here to add your first step...</p></li></ol>'

    const listItems = steps.map((step) => {
        // Only add data-step-id for persisted steps (those with IDs)
        const idAttr = isPersistedStep(step) ? ` data-step-id="${step.id}"` : ''
        return `<li${idAttr}><p>${step.name || 'Enter step description...'}</p></li>`
    }).join('')

    return `<ol>${listItems}</ol>`
}

// API function to parse scenario steps - now used for validation
async function parseScenarioStepsFromAPI(htmlContent: string): Promise<{ isValid: boolean, message?: string }> {
    try {
        // Get organization and solution context from route
        const route = useRoute(),
            { organizationslug: organizationSlug, solutionslug: solutionSlug } = route.params as { organizationslug?: string, solutionslug?: string },

            result = await $fetch<{ parsed: boolean, suggestions?: ScenarioStepSuggestionType[], error?: string }>('/api/requirements/scenario-steps/parse', {
                method: 'POST',
                body: {
                    htmlContent,
                    organizationSlug,
                    solutionSlug
                }
            })

        if (result.parsed && result.suggestions) {
            internalSteps.value = result.suggestions

            if (editor.value) {
                const newHtml = convertStepsToHtml(internalSteps.value)
                editor.value.commands.setContent(newHtml)
            }

            // Only emit persisted steps back to parent (those that already have IDs)
            const persistedSteps = internalSteps.value.filter(isPersistedStep)
            emit('update:modelValue', persistedSteps)

            return { isValid: true } // Validation successful
        } else if (!result.parsed && result.error) {
            return {
                isValid: false,
                message: 'Cannot be interpreted as scenario steps. Please provide clear, actionable steps.'
            }
        }

        return { isValid: true } // Default to valid if no suggestions but no error
    } catch (error) {
        console.warn('Failed to parse scenario steps:', error)
        return {
            isValid: false,
            message: 'Unable to process scenario steps. Please check your connection and try again.'
        }
    }
}

const validateScenarioSteps = async (): Promise<{ isValid: boolean, message?: string }> => {
    if (!editor.value?.getHTML()) return { isValid: true } // Empty is valid

    const htmlContent = editor.value.getHTML(),
        textContent = editor.value.getText()

    // Only parse if there's meaningful content (not just whitespace/empty tags)
    if (!textContent.trim()) return { isValid: true } // Empty is valid

    return await parseScenarioStepsFromAPI(htmlContent)
}

// Expose validation function to parent when component mounts
onMounted(() => {
    emit('validation-ready', validateScenarioSteps)
})

onBeforeUnmount(() => {
    if (editor.value)
        editor.value.destroy()
})
</script>

<style scoped>
:deep(.tiptap) {
    outline: none;
    font-family: inherit;
    line-height: 1.6;
}

/* Custom styles for hierarchical ordered lists */
:deep(.tiptap ol) {
    counter-reset: section;
    padding-left: 0;
    margin: 0;
    list-style: none;
}

:deep(.tiptap li) {
    display: block;
    margin: 0.25rem 0;
}

:deep(.tiptap li::before) {
    counter-increment: section;
    content: counters(section, ".") " ";
    padding-right: 5px;
    color: rgb(var(--ui-text-muted));
    font-weight: 500;
}

:deep(.tiptap ol ol) {
    padding-left: 20px;
}

/* Ensure paragraphs inside list items don't add extra spacing */
:deep(.tiptap li > p) {
    margin: 0;
    display: inline;
    line-height: 1.25;
}

/* Placeholder styling */
:deep(.scenario-editor .tiptap p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: rgb(var(--ui-text-dimmed));
    pointer-events: none;
    height: 0;
}

:deep(.scenario-editor .tiptap) {
    min-height: 80px;
    color: inherit;
}
</style>
