import { Collection, Entity, ManyToOne, OneToMany, OptionalProps, Property, types } from "@mikro-orm/core";
import { StaticAuditModel, VolatileAuditModel } from "../index.js";

// static properties
@Entity({ tableName: 'app_user' })
export class AppUserModel extends StaticAuditModel {
    [OptionalProps]?: 'latestVersion'

    @Property({ type: types.uuid, primary: true })
    readonly id!: string

    @OneToMany({ mappedBy: 'appUser', entity: () => AppUserVersionsModel })
    readonly versions = new Collection<AppUserVersionsModel>(this);

    /**
     * The latest version of the AppUser (effective_from <= now())
     */
    get latestVersion(): Promise<AppUserVersionsModel | undefined> {
        return this.versions.loadItems({
            where: {
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            },
            orderBy: { effectiveFrom: 'desc' },
        }).then(items => items[0])
    }
}

// volatile properties
@Entity({ tableName: 'app_user_versions' })
export class AppUserVersionsModel extends VolatileAuditModel {
    @ManyToOne({ entity: () => AppUserModel, primary: true })
    readonly appUser!: AppUserModel;

    @Property({ type: types.string, length: 254 })
    readonly name!: string;

    @Property({ type: types.string, length: 254 })
    readonly email!: string;

    @Property({ type: types.datetime, nullable: true })
    readonly lastLoginDate?: Date

    @Property({ type: types.boolean })
    readonly isSystemAdmin!: boolean
}