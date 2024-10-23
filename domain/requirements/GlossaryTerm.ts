import { Entity, ManyToOne } from "@mikro-orm/core";
import { Component } from "./Component.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A word or phrase that is part of a glossary. Provides a definition for the term
 */
@Entity({ discriminatorValue: ReqType.GLOSSARY_TERM })
export class GlossaryTerm extends Component {
    constructor(props: Properties<Omit<GlossaryTerm, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.GLOSSARY_TERM;
    }
}