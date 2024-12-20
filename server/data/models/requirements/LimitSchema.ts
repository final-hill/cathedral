import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.LIMIT })
export class LimitModel extends RequirementModel {
    declare readonly versions: Collection<LimitVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.LIMIT })
export class LimitVersionsModel extends RequirementVersionsModel { }