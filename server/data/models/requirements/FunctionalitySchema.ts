import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { BehaviorModel, BehaviorVersionsModel } from "./BehaviorSchema.js";

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityModel extends BehaviorModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityVersionsModel extends BehaviorVersionsModel { }