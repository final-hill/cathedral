import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import Requirement from "../../domain/requirements/Requirement.js";
import Product from "../../domain/requirements/Product.js";

export default new EntitySchema<Product, Requirement>({
    class: Product,
    extends: RequirementSchema
})