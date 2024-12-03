import { EntitySchema } from "@mikro-orm/core";
import { ReqType, Component, GlossaryTerm } from '../../../../domain/requirements/index.js';

export const GlossaryTermSchema = new EntitySchema<GlossaryTerm, Component>({
    class: GlossaryTerm,
    discriminatorValue: ReqType.GLOSSARY_TERM
})