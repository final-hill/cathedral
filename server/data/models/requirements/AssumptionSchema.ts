import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class AssumptionModel extends RequirementModel {
    declare readonly versions: Collection<AssumptionVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class AssumptionVersionsModel extends RequirementVersionsModel { }