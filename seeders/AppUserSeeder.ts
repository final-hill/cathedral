import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AppUserModel, AppUserVersionsModel } from '~/server/data/models/index.js';
import { NIL as SYSTEM_USER_ID } from 'uuid'

export class AppUserSeeder extends Seeder {
    private async _createSysAdmin(em: EntityManager, props: { id: AppUserModel['id'] }): Promise<void> {
        const sysAdminUserStatic = await em.findOne(AppUserModel, {
            id: props.id,
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
                modifiedBy: props.id
            })

            await em.flush()
        }
    }

    async run(em: EntityManager): Promise<void> {
        const isDev = process.env.NODE_ENV === 'development';

        this._createSysAdmin(em, { id: SYSTEM_USER_ID })

        if (isDev) {
            const mlHaufeId = 'a6e97f11-725b-439d-b8dc-06ca77c08dd7'
            this._createSysAdmin(em, { id: mlHaufeId })
        }
    }
}