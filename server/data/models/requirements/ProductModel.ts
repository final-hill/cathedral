import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementModel.js";

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductVersionsModel extends RequirementVersionsModel { }