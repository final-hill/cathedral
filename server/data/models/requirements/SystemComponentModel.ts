import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ComponentModel, ComponentVersionsModel } from "./ComponentModel.js";

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.SYSTEM_COMPONENT })
export class SystemComponentVersionsModel extends ComponentVersionsModel { }