import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AppUserModel } from '../server/data/models/application/index.js';
import { SYSTEM_SLACK_USER_ID, SYSTEM_USER_ID } from '../shared/constants.js';

export class AppUserSeeder extends Seeder {
    private async _createUser(
        em: EntityManager,
        props: Pick<AppUserModel, 'id' | 'name' | 'email'>
    ): Promise<void> {
        console.log(`Creating system user with id: ${props.id}`)

        const effectiveFrom = new Date(),
            existingUser = await em.findOne(AppUserModel, { id: props.id })

        if (!existingUser) {
            em.create(AppUserModel, {
                id: props.id,
                createdBy: SYSTEM_USER_ID,
                creationDate: effectiveFrom,
                lastModified: effectiveFrom,
                name: props.name,
                email: props.email,
                modifiedBy: SYSTEM_USER_ID,
                isSystemAdmin: false
            })
        } else {
            return
        }

        await em.flush()
    }

    private async _createSystemAdmin(
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
        await this._createSystemAdmin(em, {
            id: SYSTEM_USER_ID,
            name: 'System Admin',
            email: 'admin@example.com'
        })

        await this._createUser(em, {
            id: SYSTEM_SLACK_USER_ID,
            name: 'System Slack User',
            email: 'slack-bot@example.com'
        })
    }
}