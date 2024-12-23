import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { VersionedModel } from "../VersionedSchema.js";
// import { AppUserOrganizationRoleVersionsModel } from "./index.js";

// static properties
@Entity({ tableName: 'app_user' })
export class AppUserModel {
    @Property({ type: 'uuid', primary: true })
    readonly id!: string

    @Property()
    readonly creationDate!: Date

    @OneToMany({ entity: () => AppUserVersionsModel, mappedBy: 'appUser' })
    readonly versions = new Collection<AppUserVersionsModel>(this);
}

// volatile properties
@Entity({ tableName: 'app_user_versions' })
export class AppUserVersionsModel extends VersionedModel {
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