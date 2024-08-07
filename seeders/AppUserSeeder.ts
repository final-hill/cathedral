import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import AppUserSystemAdminRole from '~/server/domain/application/AppUserSystemAdminRole';

export class AppUserSeeder extends Seeder {

    async run(em: EntityManager): Promise<void> {
        const isDev = process.env.NODE_ENV === 'development';

        if (isDev) {
            const mlHaufeId = 'a6e97f11-725b-439d-b8dc-06ca77c08dd7'

            const adminCount = await em.count(AppUserSystemAdminRole, { appUserId: mlHaufeId });

            if (adminCount === 0) {
                em.create(AppUserSystemAdminRole, {
                    appUserId: mlHaufeId
                });
            }
        } else {

        }
    }

}
