import { Entity } from "@mikro-orm/core";
import { Person } from "./index.js";

/**
 * The history of a Person
 */
@Entity()
class PersonHistory extends Person { }

export { PersonHistory };