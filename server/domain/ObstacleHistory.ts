import { Entity } from "@mikro-orm/core";
import { Obstacle } from "./index.js";

/**
 * The history of an Obstacle
 */
@Entity()
class ObstacleHistory extends Obstacle { }

export { ObstacleHistory };