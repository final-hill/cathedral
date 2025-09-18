import { MoscowPriority } from '#shared/domain/requirements/enums'

export const priorityColorMap = {
    [MoscowPriority.MUST]: 'error',
    [MoscowPriority.SHOULD]: 'warning',
    [MoscowPriority.COULD]: 'info',
    [MoscowPriority.WONT]: 'neutral'
} as const

export type PriorityColor = typeof priorityColorMap[MoscowPriority]
