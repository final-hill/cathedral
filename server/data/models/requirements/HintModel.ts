import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { NoiseModel, NoiseVersionsModel } from "./NoiseModel.js";

@Entity({ discriminatorValue: ReqType.HINT })
export class HintModel extends NoiseModel {
    declare readonly versions: Collection<HintVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.HINT })
export class HintVersionsModel extends NoiseVersionsModel { }