export interface BaseStep {
    id: string
    description: string
    parentStepId?: string
    order: number
}

export interface NestedBaseStep extends BaseStep {
    children: NestedBaseStep[]
}

/**
 * Composable for managing hierarchical step structures
 * Provides common functionality for building, manipulating, and organizing steps
 */
export function useStepHierarchy<T extends BaseStep>() {
    type NestedStep = T & { children: NestedStep[] }

    /**
     * Build a nested hierarchy from a flat array of steps
     */
    function buildHierarchy(steps: T[]): NestedStep[] {
        const result: NestedStep[] = [],
            stepMap = new Map<string, NestedStep>()

        // First pass: create all nested steps
        steps.forEach((step) => {
            const nestedStep = {
                ...step,
                children: []
            }
            stepMap.set(step.id, nestedStep)
        })

        // Second pass: build hierarchy
        steps.forEach((step) => {
            const nestedStep = stepMap.get(step.id)!

            if (step.parentStepId) {
                // This is a child step
                const parent = stepMap.get(step.parentStepId)
                if (parent)
                    parent.children.push(nestedStep)
                else {
                    // Parent not found, add to root
                    result.push(nestedStep)
                }
            } else {
                // This is a top-level step
                result.push(nestedStep)
            }
        })

        // Third pass: sort all children by order
        const sortByOrder = (steps: NestedStep[]) => {
            // eslint-disable-next-line max-params
            steps.sort((a, b) => a.order - b.order)
            steps.forEach(step => sortByOrder(step.children))
        }

        // Sort root level and recursively sort all children
        sortByOrder(result)

        return result
    }

    /**
     * Find the next available order for siblings at the same level
     * @param params - steps array and optional parentStepId
     * @param params.steps - flat array of steps
     * @param params.parentStepId - parent step ID to find siblings for (undefined for top-level)
     * @returns next order number for a new sibling step
     */
    function getNextSiblingOrder({ steps, parentStepId }: { steps: T[], parentStepId?: string }): number {
        const siblings = steps.filter(s => s.parentStepId === parentStepId)
        return siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) + 1 : 0
    }

    /**
     * Find siblings of a given step
     * @param params - the steps array and the target step
     * @param params.steps - flat array of steps
     * @param params.step - the step to find siblings for
     * @returns array of sibling steps sorted by order
     */
    function getSiblings({ steps, step }: { steps: T[], step: T }): T[] {
        return steps
            .filter(s => s.parentStepId === step.parentStepId)
            // eslint-disable-next-line max-params
            .sort((a, b) => a.order - b.order)
    }

    /**
     * Find the previous sibling of a given step
     * @param params - the params object
     * @param params.steps - flat array of steps
     * @param params.step - the step to find the previous sibling for
     * @returns the previous sibling step or undefined if none exists
     */
    function getPreviousSibling({ steps, step }: { steps: T[], step: T }): T | undefined {
        const siblings = getSiblings({ steps, step }),
            currentIndex = siblings.findIndex(s => s.id === step.id)
        return currentIndex > 0 ? siblings[currentIndex - 1] : undefined
    }

    /**
     * Indent a step by making it a child of its previous sibling
     * @param params - the params object
     * @param params.steps - flat array of steps
     * @param params.stepId - ID of the step to indent
     * @returns true if indentation was successful, false otherwise
     */
    function indentStep({ steps, stepId }: { steps: T[], stepId: string }): boolean {
        const step = steps.find(s => s.id === stepId)
        if (!step) return false

        const previousSibling = getPreviousSibling({ steps, step })
        if (!previousSibling) return false

        // Change parent and assign order as next child
        const newParentChildren = steps.filter(s => s.parentStepId === previousSibling.id),
            nextOrder = newParentChildren.length > 0 ? Math.max(...newParentChildren.map(s => s.order)) + 1 : 0

        step.parentStepId = previousSibling.id
        step.order = nextOrder

        return true
    }

    /**
     * Outdent a step by moving it to the same level as its parent
     * @param params - the params object
     * @param params.steps - flat array of steps
     * @param params.stepId - ID of the step to outdent
     * @returns true if outdentation was successful, false otherwise
     */
    function outdentStep({ steps, stepId }: { steps: T[], stepId: string }): boolean {
        const step = steps.find(s => s.id === stepId)
        if (!step || !step.parentStepId) return false

        const parent = steps.find(s => s.id === step.parentStepId)
        if (!parent) return false

        // Move to the same level as the parent
        const nextOrder = getNextSiblingOrder({ steps, parentStepId: parent.parentStepId })

        step.parentStepId = parent.parentStepId
        step.order = nextOrder

        return true
    }

    /**
     * Add a new step after the given step at the same level
     * @param params - the params object
     * @param params.steps - flat array of steps
     * @param params.targetStepId - ID of the step to add after
     * @param params.newStepFactory - factory function to create a new step with given order and parentStepId
     * @returns the newly created step or null if target step not found
     */
    function addStepAfter({ steps, targetStepId, newStepFactory }: {
        steps: T[]
        targetStepId: string
        newStepFactory: ({ order, parentStepId }: { order: number, parentStepId?: string }) => T
    }): T | null {
        const targetStep = steps.find(s => s.id === targetStepId)
        if (!targetStep) return null

        // Find siblings at the same level to determine next order
        const siblings = getSiblings({ steps, step: targetStep }),
            currentOrder = targetStep.order,
            nextOrder = currentOrder + 1

        // Shift orders of subsequent siblings
        siblings.forEach((step) => {
            if (step.order >= nextOrder)
                step.order += 1
        })

        const newStep = newStepFactory({ order: nextOrder, parentStepId: targetStep.parentStepId }),
            targetIndex = steps.findIndex(s => s.id === targetStepId)
        steps.splice(targetIndex + 1, 0, newStep)

        return newStep
    }

    /**
     * Remove a step and all its descendants
     * @param params - the params object
     * @param params.steps - flat array of steps
     * @param params.stepId - ID of the step to remove
     * @returns new array of steps with the specified step and its descendants removed
     */
    function removeStepAndDescendants({ steps, stepId: ancestorId }: { steps: T[], stepId: string }): T[] {
        function isDescendantOf({ step, ancestorId }: { step: T, ancestorId: string }): boolean {
            let currentParentId = step.parentStepId
            while (currentParentId) {
                if (currentParentId === ancestorId) return true
                const parent = steps.find(s => s.id === currentParentId)
                currentParentId = parent?.parentStepId
            }
            return false
        }

        return steps.filter(step =>
            step.id !== ancestorId && !isDescendantOf({ step, ancestorId })
        )
    }

    /**
     * Shift orders of subsequent siblings after insertion/deletion
     * @param params - the params object
     * @param params.steps - flat array of steps
     * @param params.parentStepId - parent step ID to find siblings for (undefined for top-level)
     * @param params.fromOrder - order from which to start shifting
     * @param params.shift - amount to shift (positive or negative)
     */
    function shiftSiblingOrders({ steps, parentStepId, fromOrder, shift }: {
        steps: T[]
        parentStepId: string | undefined
        fromOrder: number
        shift: number
    }): void {
        steps
            .filter(s => s.parentStepId === parentStepId && s.order >= fromOrder)
            .forEach((step) => {
                step.order += shift
            })
    }

    return {
        buildHierarchy,
        getNextSiblingOrder,
        getSiblings,
        getPreviousSibling,
        indentStep,
        outdentStep,
        addStepAfter,
        removeStepAndDescendants,
        shiftSiblingOrders
    }
}
