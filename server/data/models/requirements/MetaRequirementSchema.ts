import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "./ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementModel extends RequirementModel {
    declare readonly versions: Collection<MetaRequirementVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementVersionsModel extends RequirementVersionsModel { }