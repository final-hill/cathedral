import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectModel extends RequirementModel {
    declare readonly versions: Collection<EffectVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.EFFECT })
export class EffectVersionsModel extends RequirementVersionsModel { }