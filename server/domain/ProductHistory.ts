import { Entity } from "@mikro-orm/core";
import { Product } from "./index.js";

/**
 * The history of a Product
 */
@Entity()
class ProductHistory extends Product { }

export { ProductHistory };