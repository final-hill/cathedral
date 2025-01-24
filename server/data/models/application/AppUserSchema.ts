import { Collection, Entity, ManyToOne, OneToMany, OneToOne, OptionalProps, Property, Ref } from "@mikro-orm/core";
import { StaticAuditModel, VolatileAuditModel } from "../index.js";

// static properties
@Entity({ tableName: 'app_user' })
export class AppUserModel extends StaticAuditModel {
    [OptionalProps]?: 'latestVersion'

    @Property({ type: 'uuid', primary: true })
    readonly id!: string

    @OneToMany({ entity: () => AppUserVersionsModel, mappedBy: 'appUser' })
    readonly versions = new Collection<AppUserVersionsModel>(this);

    @OneToOne({
        entity: () => AppUserVersionsModel,
        ref: true,
        formula: alias =>
            `select id
            from app_user_versions
            where app_user_id = ${alias}.id
            and effective_from <= now()
            and is_deleted = false
            order by effective_from
            desc limit 1`
    })
    readonly latestVersion?: Ref<AppUserVersionsModel>
}

// volatile properties
@Entity({ tableName: 'app_user_versions' })
export class AppUserVersionsModel extends VolatileAuditModel {
    @ManyToOne({ entity: () => AppUserModel, primary: true })
    readonly appUser!: AppUserModel;

    @Property({ length: 254 })
    readonly name!: string;

    @Property({ length: 254 })
    readonly email!: string;

    @Property({ nullable: true })
    readonly lastLoginDate?: Date

    @Property()
    readonly isSystemAdmin!: boolean
}