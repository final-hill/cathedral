import { Collection, Entity, ManyToOne, OneToMany, Property, types } from "@mikro-orm/core";
import { StaticAuditModel, VolatileAuditModel } from "../index.js";

// static properties
@Entity({ tableName: 'app_user' })
export class AppUserModel extends StaticAuditModel<AppUserVersionsModel> {
    @Property({ type: types.uuid, primary: true })
    readonly id!: string

    @OneToMany(() => AppUserVersionsModel, (e) => e.appUser, { orderBy: { effectiveFrom: 'desc' } })
    readonly versions = new Collection<AppUserVersionsModel>(this);
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