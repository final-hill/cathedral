import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { MetaRequirementModel, MetaRequirementVersionsModel } from "./MetaRequirementSchema.js";

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationModel extends MetaRequirementModel {
    declare readonly versions: Collection<JustificationVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class JustificationVersionsModel extends MetaRequirementVersionsModel { }