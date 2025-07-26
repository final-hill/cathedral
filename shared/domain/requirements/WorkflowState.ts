/**
 * Enum representing the various states a requirement can be in during its lifecycle.
 * Each state indicates a specific phase in the workflow of the requirement.
 */
export enum WorkflowState {
    /**
     * This state indicates that a new requirement has been proposed and is awaiting review or approval.
     */
    Proposed = 'Proposed',
    /**
     * This state signifies that a requirement has been rejected and is no longer being considered for implementation.
     */
    Rejected = 'Rejected',
    /**
     * This state indicates that a requirement has been removed or deleted from the workflow.
     */
    Removed = 'Removed',
    /**
     * This state signifies that a requirement is currently being reviewed or evaluated for implementation.
     */
    Review = 'Review',
    /**
     * This state indicates that a requirement is currently being implemented or is an active part of the project.
     */
    Active = 'Active',
    /**
     * This state indicates that a ParsedRequirements container is not actionable in itself,
     * but exists to group auto-generated requirements for further review.
     * ParsedRequirements are always in this state.
     */
    Parsed = 'Parsed'
}
