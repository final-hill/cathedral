/**
 * Defines the different review status states for requirements and endorsements
 */
export enum ReviewStatus {
    /**
     * No review activity has been initiated
     */
    NONE = 'none',
    /**
     * Review is in progress but not complete
     */
    PENDING = 'pending',
    /**
     * Some review items are complete but others remain pending
     */
    PARTIAL = 'partial',
    /**
     * All required review items have been approved
     */
    APPROVED = 'approved',
    /**
     * One or more review items have been rejected
     */
    REJECTED = 'rejected'
}
