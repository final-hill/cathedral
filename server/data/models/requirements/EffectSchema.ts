import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectModel extends RequirementModel {
    declare readonly versions: Collection<EffectVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectVersionsModel extends RequirementVersionsModel { }