import type { AppUser } from '#shared/domain/application'
import type { z } from 'zod'

export type CreationInfo = {
    createdById: z.infer<typeof AppUser>['id']
    creationDate: Date
}
