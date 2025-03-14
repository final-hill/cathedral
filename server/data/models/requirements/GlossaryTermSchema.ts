import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ComponentModel, ComponentVersionsModel } from "./ComponentSchema.js";

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermModel extends ComponentModel {
    declare readonly versions: Collection<GlossaryTermVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTermVersionsModel extends ComponentVersionsModel { }