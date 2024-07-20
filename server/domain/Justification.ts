import { Entity } from "@mikro-orm/core";
import MetaRequirement from "./MetaRequirement.js";

/**
 * Explanation of a project or system property in reference to a goal or environment property
 */
@Entity()
export default class Justification extends MetaRequirement { }
