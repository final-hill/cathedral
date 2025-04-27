import { Collection, Entity, Enum, ManyToOne, OneToMany, type Ref } from "@mikro-orm/core";
import { AppRole } from '../../../../shared/domain/index.js';
import { StaticAuditModel, VolatileAuditModel } from "../AuditModel.js";
import { AppUserModel, } from "./index.js"
import { OrganizationModel } from "../requirements/index.js";

@Entity({ tableName: 'app_user_organization_role' })
export class AppUserOrganizationRoleModel extends StaticAuditModel<AppUserOrganizationRoleVersionsModel> {
    @ManyToOne({ primary: true, entity: () => AppUserModel })
    readonly appUser!: AppUserModel;

    @ManyToOne({ primary: true, entity: () => OrganizationModel, ref: true })
    readonly organization!: Ref<OrganizationModel>;

    @OneToMany(() => AppUserOrganizationRoleVersionsModel, (e) => e.appUserOrganizationRole, { orderBy: { effectiveFrom: 'desc' } })
    readonly versions = new Collection<AppUserOrganizationRoleVersionsModel>(this);
}

@Entity({ tableName: 'app_user_organization_role_versions' })
export class AppUserOrganizationRoleVersionsModel extends VolatileAuditModel {
    @ManyToOne({ primary: true, entity: () => AppUserOrganizationRoleModel })
    readonly appUserOrganizationRole!: AppUserOrganizationRoleModel;

    @Enum({ items: () => AppRole })
    readonly role!: AppRole
}