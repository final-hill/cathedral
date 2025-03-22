import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";
import { Collection, Entity, Property, types } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends RequirementModel {
    declare readonly versions: Collection<OrganizationVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends RequirementVersionsModel {
    declare readonly requirement: OrganizationModel

    @Property({ type: types.string })
    readonly slug!: string
}