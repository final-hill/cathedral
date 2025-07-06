import type { AppUser } from '#shared/domain/application'
import type { z } from 'zod'

export type UpdationInfo = {
    modifiedById: z.infer<typeof AppUser>['id']
    modifiedDate: Date
}
