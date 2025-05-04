import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AppUserModel } from '../server/data/models/application/index.js';
import { NIL as SYSTEM_USER_ID } from 'uuid'

export class AppUserSeeder extends Seeder {
    private async _createSysAdmin(
        em: EntityManager,
        props: Pick<AppUserModel, 'id' | 'name' | 'email'>
    ): Promise<void> {
        console.log(`Creating system admin user with id: ${props.id}`)

        const effectiveFrom = new Date(),
            existingSysAdmin = await em.findOne(AppUserModel, {
                id: props.id,
                isSystemAdmin: true
            })

        if (!existingSysAdmin) {
            em.create(AppUserModel, {
                id: props.id,
                createdBy: SYSTEM_USER_ID,
                creationDate: effectiveFrom,
                lastModified: effectiveFrom,
                name: props.name,
                email: props.email,
                isSystemAdmin: true,
                modifiedBy: SYSTEM_USER_ID
            })
        } else {
            return
        }

        await em.flush()
    }

    async run(em: EntityManager): Promise<void> {
        await this._createSysAdmin(em, {
            id: SYSTEM_USER_ID,
            name: 'System Admin',
            email: 'admin@example.com'
        })
    }
}