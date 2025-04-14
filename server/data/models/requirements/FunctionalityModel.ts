import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { BehaviorModel, BehaviorVersionsModel } from "./BehaviorModel.js";

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityModel extends BehaviorModel { }

@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class FunctionalityVersionsModel extends BehaviorVersionsModel { }