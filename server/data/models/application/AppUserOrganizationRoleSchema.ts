import { Collection, Entity, Enum, ManyToOne, OneToMany, OptionalProps, type Ref } from "@mikro-orm/core";
import { AppRole } from "../../../../domain/application/index.js";
import { StaticAuditModel, VolatileAuditModel } from "../AuditSchema.js";
import { AppUserModel, } from "./index.js"
import { OrganizationModel } from "../requirements/index.js";

// static properties
@Entity({ tableName: 'app_user_organization_role' })
export class AppUserOrganizationRoleModel extends StaticAuditModel {
    [OptionalProps]?: 'latestVersion'

    @ManyToOne({ primary: true, entity: () => AppUserModel })
    readonly appUser!: AppUserModel;

    @ManyToOne({ primary: true, entity: () => OrganizationModel })
    readonly organization!: Ref<OrganizationModel>;

    @OneToMany({ mappedBy: 'appUserOrganizationRole', entity: () => AppUserOrganizationRoleVersionsModel })
    readonly versions = new Collection<AppUserOrganizationRoleVersionsModel>(this);

    /**
     * The latest version of the relation (effective_from <= now())
     */
    get latestVersion(): Promise<AppUserOrganizationRoleVersionsModel | undefined> {
        return this.versions.loadItems({
            where: {
                effectiveFrom: { $lte: new Date() },
                isDeleted: false
            },
            orderBy: { effectiveFrom: 'desc' },
        }).then(items => items[0])
    }
}

// volatile properties
@Entity({ tableName: 'app_user_organization_role_versions' })
export class AppUserOrganizationRoleVersionsModel extends VolatileAuditModel {
    @ManyToOne({ primary: true, entity: () => AppUserOrganizationRoleModel })
    readonly appUserOrganizationRole!: AppUserOrganizationRoleModel;

    @Enum({ items: () => AppRole })
    readonly role!: AppRole
}