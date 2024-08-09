import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import AppUser from '../server/domain/application/AppUser.js';

export class AppUserSeeder extends Seeder {

    async run(em: EntityManager): Promise<void> {
        const isDev = process.env.NODE_ENV === 'development';

        if (isDev) {
            const mlHaufeId = 'a6e97f11-725b-439d-b8dc-06ca77c08dd7'

            const sysAdminUser = await em.findOne(AppUser, {
                id: mlHaufeId
            })

            if (sysAdminUser) {
                sysAdminUser.isSystemAdmin = true
                await em.flush()
            }
        }
    }
}