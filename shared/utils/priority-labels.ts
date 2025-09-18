import { MoscowPriority } from '#shared/domain/requirements/enums'

/**
 * Standardized MoSCoW Priority labels mapping for consistent display across the application
 */
export const priorityLabelMap: Record<MoscowPriority, string> = {
    [MoscowPriority.MUST]: 'Must Have',
    [MoscowPriority.SHOULD]: 'Should Have',
    [MoscowPriority.COULD]: 'Could Have',
    [MoscowPriority.WONT]: 'Won\'t Have'
}
