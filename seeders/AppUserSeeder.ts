import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AppUserModel, AppUserVersionsModel } from '~/server/data/models/index.js';

export class AppUserSeeder extends Seeder {

    async run(em: EntityManager): Promise<void> {
        const isDev = process.env.NODE_ENV === 'development';

        if (isDev) {
            const mlHaufeId = 'a6e97f11-725b-439d-b8dc-06ca77c08dd7'

            const sysAdminUserStatic = await em.findOne(AppUserModel, {
                id: mlHaufeId,
                latestVersion: { isDeleted: false }
            }, {
                populate: ['latestVersion']
            }),
                latestVersion = sysAdminUserStatic?.latestVersion?.get(),
                effectiveDate = new Date()

            if (latestVersion && !latestVersion.isSystemAdmin) {
                em.create(AppUserVersionsModel, {
                    ...latestVersion,
                    isSystemAdmin: true,
                    effectiveFrom: effectiveDate,
                    modifiedBy: mlHaufeId
                })

                await em.flush()
            }
        }
    }
}