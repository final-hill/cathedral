import { Entity } from "@mikro-orm/core";
import { UserStory } from "./index.js";

/**
 * The history of a UserStory
 */
@Entity()
class UserStoryHistory extends UserStory { }

export { UserStoryHistory };