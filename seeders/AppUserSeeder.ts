import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import AppUser from '../server/domain/application/AppUser.js';

export class AppUserSeeder extends Seeder {

    async run(em: EntityManager): Promise<void> {
        const sysAdminUserCount = await em.count(AppUser, { id: 'tno@thenewobjective.com' });

        if (sysAdminUserCount > 0)
            return;

        em.create(AppUser, {
            id: 'tno@thenewobjective.com',
            name: 'Michael L Haufe',
            creationDate: new Date(),
            isSystemAdmin: true
        });
    }

}
