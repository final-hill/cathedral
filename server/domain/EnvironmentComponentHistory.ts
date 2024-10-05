import { Entity } from "@mikro-orm/core";
import { EnvironmentComponent } from "./index.js";

/**
 * The history of an EnvironmentComponent
 */
@Entity()
class EnvironmentComponentHistory extends EnvironmentComponent { }

export { EnvironmentComponentHistory };