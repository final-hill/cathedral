import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Requirement, Product } from "../../domain/requirements/index.js";

export default new EntitySchema<Product, Requirement>({
    class: Product,
    extends: RequirementSchema
})