import type { Ref } from 'vue'
import type { ReviewStatus } from '#shared/domain/endorsement'

/**
 * Interface that all review category components must expose
 * This ensures consistent integration with the parent RequirementReview component
 */
export interface ReviewComponentInterface {
    /**
     * Current review status for this category
     */
    status: Readonly<Ref<ReviewStatus>>
}
