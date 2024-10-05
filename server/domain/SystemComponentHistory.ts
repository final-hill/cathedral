import { Entity } from "@mikro-orm/core";
import { SystemComponent } from "./index.js"

/**
 * The history of a SystemComponent
 */
@Entity()
class SystemComponentHistory extends SystemComponent { }

export { SystemComponentHistory };