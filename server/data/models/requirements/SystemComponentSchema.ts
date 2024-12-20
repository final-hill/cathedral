import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { ComponentModel, ComponentVersionsModel } from "./ComponentSchema.js";

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentModel extends ComponentModel {
    declare readonly versions: Collection<SystemComponentVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentVersionsModel extends ComponentVersionsModel { }