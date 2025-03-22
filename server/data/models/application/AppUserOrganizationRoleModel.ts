import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, type Ref } from "@mikro-orm/core";
import { AppRole } from '../../../../shared/domain/index.js';
import { StaticAuditModel, VolatileAuditModel } from "../AuditModel.js";
import { AppUserModel, } from "./index.js"
import { OrganizationModel } from "../requirements/index.js";

// static properties
@Entity({ tableName: 'app_user_organization_role' })
export class AppUserOrganizationRoleModel extends StaticAuditModel<AppUserOrganizationRoleVersionsModel> {
    [OptionalProps]?: 'latestVersion'

    @ManyToOne({ primary: true, entity: () => AppUserModel })
    readonly appUser!: AppUserModel;

    @ManyToOne({ primary: true, ref: true, entity: () => OrganizationModel })
    readonly organization!: Ref<OrganizationModel>;

    @OneToMany({ mappedBy: 'appUserOrganizationRole', entity: () => AppUserOrganizationRoleVersionsModel })
    readonly versions = new Collection<AppUserOrganizationRoleVersionsModel>(this);
}

// volatile properties
@Entity({ tableName: 'app_user_organization_role_versions' })
export class AppUserOrganizationRoleVersionsModel extends VolatileAuditModel {
    @ManyToOne({ primary: true, entity: () => AppUserOrganizationRoleModel })
    readonly appUserOrganizationRole!: AppUserOrganizationRoleModel;

    @Enum({ items: () => AppRole })
    readonly role!: AppRole
}