import { Collection, Entity, Enum, Formula, ManyToOne, OneToMany, OneToOne, OptionalProps, type Ref } from "@mikro-orm/core";
import { AppRole } from "../../../../domain/application/index.js";
import { StaticAuditModel, VolatileAuditModel } from "../AuditSchema.js";
import { AppUserModel, } from "./index.js"
import { OrganizationModel } from "../requirements/index.js";

// static properties
@Entity({ tableName: 'app_user_organization_role' })
export class AppUserOrganizationRoleModel extends StaticAuditModel {
    [OptionalProps]?: 'latestVersion'

    @ManyToOne({ primary: true })
    readonly appUser!: AppUserModel;

    @ManyToOne({ primary: true })
    readonly organization!: Ref<OrganizationModel>;

    @OneToMany({ mappedBy: 'appUserOrganizationRole' })
    readonly versions = new Collection<AppUserOrganizationRoleVersionsModel>(this);

    // Select the latest version id of the requirement (effective_from <= now())
    @Formula(alias =>
        `select id, effective_from
        from app_user_organization_role_versions
        where app_user_organization_role_id = ${alias}.id
        and effective_from <= now()
        and is_deleted = false
        order by effective_from
        desc limit 1`
    )
    readonly latestVersion?: Ref<AppUserOrganizationRoleVersionsModel>;
}

// volatile properties
@Entity({ tableName: 'app_user_organization_role_versions' })
export class AppUserOrganizationRoleVersionsModel extends VolatileAuditModel {
    @ManyToOne({ primary: true })
    readonly appUserOrganizationRole!: AppUserOrganizationRoleModel;

    @Enum({ items: () => AppRole })
    readonly role!: AppRole
}