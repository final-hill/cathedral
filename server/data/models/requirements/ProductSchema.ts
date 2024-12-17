import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductVersionsModel extends RequirementVersionsModel { }