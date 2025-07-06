import type { AppUser } from '#shared/domain/application'
import type { z } from 'zod'

export type DeletionInfo = {
    deletedById: z.infer<typeof AppUser>['id']
    deletedDate: Date
}
