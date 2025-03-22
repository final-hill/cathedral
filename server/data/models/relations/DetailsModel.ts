import { Entity } from "@mikro-orm/core";
import { RelType } from "./RelType.js";
import { ExtendsModel, ExtendsVersionsModel } from "./ExtendsModel.js";

@Entity({ discriminatorValue: RelType.DETAILS })
export class DetailsModel extends ExtendsModel { }

@Entity({ discriminatorValue: RelType.DETAILS })
export class DetailsVersionsModel extends ExtendsVersionsModel {
    declare readonly requirementRelation: DetailsModel
}