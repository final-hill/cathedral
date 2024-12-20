import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";
import { AppUserOrganizationRoleVersionsModel } from "../application/AppUserOrganizationRoleSchema.js";
import { AppUserVersionsModel } from "../application/AppUserSchema.js";

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends RequirementModel {
    declare readonly versions: Collection<OrganizationVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends RequirementVersionsModel {
    declare readonly requirement: OrganizationModel

    @Property()
    readonly slug!: string

    @ManyToMany({ entity: () => AppUserVersionsModel, pivotEntity: () => AppUserOrganizationRoleVersionsModel, inversedBy: 'organizations' })
    appUsers = new Collection<AppUserVersionsModel>(this)
}