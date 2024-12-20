import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { ActorModel, ActorVersionsModel } from "./ActorSchema.js";

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentModel extends ActorModel {
    declare readonly versions: Collection<ComponentVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentVersionsModel extends ActorVersionsModel { }