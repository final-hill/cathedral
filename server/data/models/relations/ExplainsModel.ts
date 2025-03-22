import { Entity } from "@mikro-orm/core";
import { RelType } from "./RelType.js";
import { RepeatsModel, RepeatsVersionsModel } from "./RepeatsModel.js";

@Entity({ discriminatorValue: RelType.EXPLAINS })
export class ExplainsModel extends RepeatsModel { }

@Entity({ discriminatorValue: RelType.EXPLAINS })
export class ExplainsVersionsModel extends RepeatsVersionsModel {
    declare readonly requirementRelation: ExplainsModel
}