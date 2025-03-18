import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.NOISE })
export class NoiseModel extends RequirementModel {
    declare readonly versions: Collection<NoiseVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.NOISE })
export class NoiseVersionsModel extends RequirementVersionsModel { }