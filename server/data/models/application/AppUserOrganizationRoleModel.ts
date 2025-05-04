import { Entity, Enum, ManyToOne, Property, type Ref, types } from "@mikro-orm/core";
import { AppRole } from '../../../../shared/domain/index.js';
import { AppUserModel, } from "./index.js"
import { OrganizationModel } from "../requirements/index.js";

@Entity({ tableName: 'app_user_organization_role' })
export class AppUserOrganizationRoleModel {
    @ManyToOne({ primary: true, entity: () => AppUserModel })
    readonly appUser!: AppUserModel;

    @ManyToOne({ primary: true, entity: () => OrganizationModel, ref: true })
    readonly organization!: Ref<OrganizationModel>;

    @Enum({ items: () => AppRole })
    readonly role!: AppRole

    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: AppUserModel;

    @Property({ type: types.datetime })
    readonly creationDate!: Date;

    @ManyToOne({ entity: () => AppUserModel })
    readonly modifiedBy!: AppUserModel;

    @Property({ type: types.datetime, nullable: true })
    readonly lastModified?: Date
}