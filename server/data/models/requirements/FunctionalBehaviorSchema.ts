import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { FunctionalityModel, FunctionalityVersionsModel } from "./FunctionalitySchema.js";

@Entity({ discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR })
export class FunctionalBehaviorModel extends FunctionalityModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR })
export class FunctionalBehaviorVersionsModel extends FunctionalityVersionsModel { }