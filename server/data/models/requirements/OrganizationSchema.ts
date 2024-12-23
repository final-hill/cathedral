import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";
import { Collection, Entity, Property } from "@mikro-orm/core";
import { ReqType } from "./ReqType.js";

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends RequirementModel {
    declare readonly versions: Collection<OrganizationVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends RequirementVersionsModel {
    declare readonly requirement: OrganizationModel

    @Property()
    readonly slug!: string
}