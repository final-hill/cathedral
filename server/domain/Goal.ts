import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";

/**
 * A result desired by an organization.
 * an objective of the project or system, in terms
 * of their desired effect on the environment
 */
@Entity({ abstract: true })
export abstract class Goal extends Requirement { }