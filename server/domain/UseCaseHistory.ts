import { Entity } from "@mikro-orm/core";
import { UseCase } from "./index.js";

/**
 * The history of a UseCase
 */
@Entity()
class UseCaseHistory extends UseCase { }

export { UseCaseHistory };