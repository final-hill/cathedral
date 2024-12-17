import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { ComponentModel, ComponentVersionsModel } from "./ComponentSchema.js";

@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponentModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.ENVIRONMENT_COMPONENT })
export class EnvironmentComponentVersionsModel extends ComponentVersionsModel { }