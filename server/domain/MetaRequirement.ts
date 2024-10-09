import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";

/**
 * Property of requirements themselves (not of the Project, Environment, Goals, or System)
 */
@Entity({ abstract: true })
export abstract class MetaRequirement extends Requirement { }