import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { NoiseModel, NoiseVersionsModel } from "./NoiseSchema.js";

@Entity({ discriminatorValue: ReqType.HINT })
export class HintModel extends NoiseModel { }

@Entity({ discriminatorValue: ReqType.HINT })
export class HintVersionsModel extends NoiseVersionsModel { }