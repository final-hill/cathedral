import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "./ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantModel extends RequirementModel {
    declare readonly versions: Collection<InvariantVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.INVARIANT })
export class InvariantVersionsModel extends RequirementVersionsModel { }