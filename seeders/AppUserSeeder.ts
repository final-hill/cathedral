import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AppUserModel, AppUserVersionsModel } from '../server/data/models/application/index.js';
import { NIL as SYSTEM_USER_ID } from 'uuid'

export class AppUserSeeder extends Seeder {
    private async _createSysAdmin(
        em: EntityManager,
        props: Pick<AppUserModel, "id"> & Partial<Pick<AppUserVersionsModel, 'name' | 'email'>>
    ): Promise<void> {
        console.log(`Creating system admin user with id: ${props.id}`)

        const name = props.id === SYSTEM_USER_ID ? 'System Admin' : props.name ?? '{Unknown}',
            email = props.id === SYSTEM_USER_ID ? 'admin@example.com' : props.email ?? 'unknown@example.com'

        const effectiveFrom = new Date(),
            latestSysAdminVersion = await em.findOne(AppUserVersionsModel, {
                appUser: { id: props.id },
                isSystemAdmin: true
            }, {
                orderBy: {
                    effectiveFrom: 'desc'
                }
            })

        if (!latestSysAdminVersion || latestSysAdminVersion.isDeleted) {
            em.create(AppUserVersionsModel, {
                appUser: em.create(AppUserModel, {
                    id: props.id,
                    createdBy: SYSTEM_USER_ID,
                    creationDate: effectiveFrom
                }),
                effectiveFrom,
                name,
                email,
                isSystemAdmin: true,
                isDeleted: false,
                modifiedBy: SYSTEM_USER_ID
            })
        } else {
            // System admin already exists
            return
        }

        await em.flush()
    }

    async run(em: EntityManager): Promise<void> {
        const isDev = process.env.NODE_ENV === 'development';

        await this._createSysAdmin(em, {
            id: SYSTEM_USER_ID,
            name: 'System Admin'
        })

        if (isDev) {
            const mlHaufeId = '561eec8c-55b8-4857-bab1-4e11265251cd'
            await this._createSysAdmin(em, { id: mlHaufeId })
        }
    }
}