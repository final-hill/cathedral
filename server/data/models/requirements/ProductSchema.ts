import { EntitySchema } from "@mikro-orm/core";
import { Product, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const ProductSchema = new EntitySchema<Product, Requirement>({
    class: Product,
    discriminatorValue: ReqType.PRODUCT
})