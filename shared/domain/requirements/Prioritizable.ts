import { z } from 'zod'
import { MoscowPriority } from './MoscowPriority.js'

export const Prioritizable = z.object({
    priority: z.nativeEnum(MoscowPriority).optional().describe('The Moscow Priority')
}).describe('Properties for prioritizable entities using Moscow Priority method.')

export type PrioritizableType = z.infer<typeof Prioritizable>
