import { Entity } from "@mikro-orm/core";
import { Actor } from "./Actor.js";

/**
 * Idenfitication of a part (of the Project, Environment, Goals, or System)
 */
@Entity({ abstract: true })
export abstract class Component extends Actor { }
