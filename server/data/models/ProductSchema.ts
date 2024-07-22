import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/Requirement.js";
import Product from "../../domain/Product.js";

export default new EntitySchema<Product, Requirement>({
    class: Product,
    extends: RequirementSchema
})