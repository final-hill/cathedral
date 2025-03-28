import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementModel extends RequirementModel {
    declare readonly versions: Collection<MetaRequirementVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirementVersionsModel extends RequirementVersionsModel { }