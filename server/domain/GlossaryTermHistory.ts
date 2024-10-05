import { Entity } from "@mikro-orm/core";
import { GlossaryTerm } from "./index.js";

/**
 * The history of a GlossaryTerm
 */
@Entity()
class GlossaryTermHistory extends GlossaryTerm { }

export { GlossaryTermHistory }