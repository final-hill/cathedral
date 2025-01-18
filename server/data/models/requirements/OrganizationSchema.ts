import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";
import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { ReqType } from "./ReqType.js";
import { SolutionModel } from "./SolutionSchema.js";

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends RequirementModel {
    declare readonly versions: Collection<OrganizationVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends RequirementVersionsModel {
    declare readonly requirement: OrganizationModel

    @Property()
    readonly slug!: string

    // TODO
}