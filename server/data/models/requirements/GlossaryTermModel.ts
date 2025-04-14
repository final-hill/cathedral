import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ComponentModel, ComponentVersionsModel } from "./ComponentModel.js";

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermVersionsModel extends ComponentVersionsModel { }