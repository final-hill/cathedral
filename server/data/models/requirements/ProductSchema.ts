import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductModel extends RequirementModel {
    declare readonly versions: Collection<ProductVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.PRODUCT })
export class ProductVersionsModel extends RequirementVersionsModel { }