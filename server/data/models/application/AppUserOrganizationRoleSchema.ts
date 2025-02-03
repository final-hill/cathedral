import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, OptionalProps, type Ref } from "@mikro-orm/core";
import { AppRole } from "../../../../domain/application/index.js";
import { StaticAuditModel, VolatileAuditModel } from "../AuditSchema.js";
import { AppUserModel, } from "./index.js"
import { OrganizationModel } from "../requirements/index.js";

// static properties
@Entity({ tableName: 'app_user_organization_role' })
export class AppUserOrganizationRoleModel extends StaticAuditModel {
    [OptionalProps]?: 'latestVersion'

    @ManyToOne({ primary: true, entity: 'AppUserModel' })
    readonly appUser!: AppUserModel;

    @ManyToOne({ primary: true, entity: 'OrganizationModel' })
    readonly organization!: OrganizationModel;

    @OneToMany({ entity: 'AppUserOrganizationRoleVersionsModel', mappedBy: 'appUserOrganizationRole' })
    readonly versions = new Collection<AppUserOrganizationRoleVersionsModel>(this);

    @OneToOne({
        entity: () => AppUserOrganizationRoleVersionsModel,
        ref: true,
        formula: alias =>
            `select id
            from app_user_organization_role_versions
            where app_user_organization_role_id = ${alias}.id
            and effective_from <= now()
            and is_deleted = false
            order by effective_from
            desc limit 1`
    })
    readonly latestVersion?: Ref<AppUserOrganizationRoleVersionsModel>;
}

// volatile properties
@Entity({ tableName: 'app_user_organization_role_versions' })
export class AppUserOrganizationRoleVersionsModel extends VolatileAuditModel {
    @ManyToOne({ primary: true, entity: 'AppUserOrganizationRoleModel' })
    readonly appUserOrganizationRole!: AppUserOrganizationRoleModel;

    @Enum({ items: () => AppRole })
    readonly role!: AppRole
}