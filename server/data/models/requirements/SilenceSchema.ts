import { Collection, Entity } from '@mikro-orm/core';
import { ReqType } from "./ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceModel extends RequirementModel {
    declare readonly versions: Collection<SilenceVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.SILENCE })
export class SilenceVersionsModel extends RequirementVersionsModel { }