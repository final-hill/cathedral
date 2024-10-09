import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";

/**
 * A part of a Project, Environment, System, or Goals that may affect or be affected by the associated entities
 */
@Entity({ abstract: true })
export abstract class Actor extends Requirement { }
