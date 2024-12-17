import { Entity } from "@mikro-orm/core";
import { RelType } from "./RelType.js";
import { ExtendsModel, ExtendsVersionsModel } from "./ExtendsSchema.js";

@Entity({ discriminatorValue: RelType.DETAILS })
export class DetailsModel extends ExtendsModel { }

@Entity({ discriminatorValue: RelType.DETAILS })
export class DetailsVersionsModel extends ExtendsVersionsModel {
    declare readonly requirementRelation: DetailsModel
}