import { Entity } from "@mikro-orm/core";
import { Requirement } from "./index.js";

/**
 * Property of requirements themselves (not of the Project, Environment, Goals, or System)
 */
@Entity({ abstract: true })
abstract class MetaRequirement extends Requirement { }

export { MetaRequirement };