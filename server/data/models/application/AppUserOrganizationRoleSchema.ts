import { Collection, Entity, Enum, ManyToOne, OneToMany } from "@mikro-orm/core";
import { AppRole } from "../../../../domain/application/index.js";
import { VolatileAuditModel } from "../AuditSchema.js";
import { AppUserModel } from "./AppUserSchema.js";
import { OrganizationModel } from "../requirements/index.js";

// static properties
@Entity({ tableName: 'app_user_organization_role' })
export class AppUserOrganizationRoleModel {
    @ManyToOne({ primary: true, entity: 'AppUserModel' })
    readonly appUser!: AppUserModel;

    @ManyToOne({ primary: true, entity: 'OrganizationModel' })
    readonly organization!: OrganizationModel;

    @OneToMany({ entity: 'AppUserOrganizationRoleVersionsModel', mappedBy: 'appUserOrganizationRole' })
    readonly versions = new Collection<AppUserOrganizationRoleVersionsModel>(this);
}

// volatile properties
@Entity({ tableName: 'app_user_organization_role_versions' })
export class AppUserOrganizationRoleVersionsModel extends VolatileAuditModel {
    @ManyToOne({ primary: true, entity: 'AppUserOrganizationRoleModel' })
    readonly appUserOrganizationRole!: AppUserOrganizationRoleModel;

    @Enum({ items: () => AppRole })
    readonly role!: AppRole
}