import { Entity } from "@mikro-orm/core";
import Goal from "./Goal.js";

/**
 * Obstacles are the challenges that prevent the goals from being achieved.
 */
@Entity()
export default class Obstacle extends Goal { }
