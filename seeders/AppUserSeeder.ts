import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AppUser } from '../domain/application/index.js';

export class AppUserSeeder extends Seeder {

    async run(em: EntityManager): Promise<void> {
        if (['development', 'test'].includes(process.env.NODE_ENV)) {
            const mlHaufeId = 'a6e97f11-725b-439d-b8dc-06ca77c08dd7'

            const sysAdminUser = await em.findOne(AppUser, {
                id: mlHaufeId
            })

            if (sysAdminUser) {
                sysAdminUser.isSystemAdmin = true
                await em.persistAndFlush(sysAdminUser)
            }
        }
    }
}