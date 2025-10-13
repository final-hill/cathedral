import type { ComponentPublicInstance } from 'vue'

/**
 * Composable for managing step references and focus
 * Provides common functionality for setting refs and focusing steps
 */
export function useStepRefs() {
    const stepRefs = ref<Record<string, ComponentPublicInstance | Element>>({})

    function setStepRef({ key, el }: { key: string, el: ComponentPublicInstance | Element | null }) {
        if (el)
            stepRefs.value[key] = el
    }

    function focusStep(key: string) {
        nextTick(() => {
            const element = stepRefs.value[key]
            if (element) {
                // Handle both ComponentPublicInstance and Element types
                const targetElement = '$el' in element ? element.$el : element
                if (targetElement instanceof Element) {
                    const input = targetElement.querySelector('input')
                    if (input)
                        input.focus()
                }
            }
        })
    }

    function clearStepRefs() {
        stepRefs.value = {}
    }

    return {
        stepRefs: readonly(stepRefs),
        setStepRef,
        focusStep,
        clearStepRefs
    }
}
