import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import AppRole from '../server/domain/application/AppRole.js';

export class AppRoleSeeder extends Seeder {

    async run(em: EntityManager): Promise<void> {
        const totalRoles = await em.count(AppRole, {})

        if (totalRoles > 0)
            return;

        em.create(AppRole, { name: 'Organization Admin' });
        em.create(AppRole, { name: 'Organization Contributor' });
        em.create(AppRole, { name: 'Organization Reader' });
    }
}
