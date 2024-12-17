import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { AppRole } from "../../../../domain/application/index.js";
import { VersionedModel } from "../VersionedSchema.js";

// static properties
@Entity({ tableName: 'app_user' })
export class AppUserModel {
    @Property({ type: 'uuid', primary: true })
    readonly id!: string

    @Property()
    readonly creationDate!: Date
}

// volatile properties
@Entity({ tableName: 'app_user_versions' })
export class AppUserVersionsModel extends VersionedModel {
    @ManyToOne({ entity: () => 'AppUser', primary: true })
    readonly appUser!: AppUserModel;

    @Property({ length: 254 })
    readonly name!: string;

    @Property({ length: 254 })
    readonly email!: string;

    @Property({ nullable: true })
    readonly lastLoginDate?: Date

    @Property()
    readonly isSystemAdmin!: boolean

    // FIXME: this field is not mapped (persist: false). It is populated in the API layer.
    // It's a design smell that needs to be addressed.
    @Enum({ items: () => AppRole, persist: false })
    readonly role?: AppRole
}