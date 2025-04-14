import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";
import { Entity, Property, types } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends RequirementVersionsModel {
    @Property({ type: types.string })
    readonly slug!: string
}