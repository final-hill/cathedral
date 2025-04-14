import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { NoiseModel, NoiseVersionsModel } from "./NoiseModel.js";

@Entity({ discriminatorValue: ReqType.HINT })
export class HintModel extends NoiseModel { }

@Entity({ discriminatorValue: ReqType.HINT })
export class HintVersionsModel extends NoiseVersionsModel { }