import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { FunctionalityModel, FunctionalityVersionsModel } from "./FunctionalityModel.js";

@Entity({ discriminatorValue: ReqType.NON_FUNCTIONAL_BEHAVIOR })
export class NonFunctionalBehaviorModel extends FunctionalityModel { }

@Entity({ discriminatorValue: ReqType.NON_FUNCTIONAL_BEHAVIOR })
export class NonFunctionalBehaviorVersionsModel extends FunctionalityVersionsModel { }