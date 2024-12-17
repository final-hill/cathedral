import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { ComponentModel, ComponentVersionsModel } from "./ComponentSchema.js";

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermVersionsModel extends ComponentVersionsModel { }