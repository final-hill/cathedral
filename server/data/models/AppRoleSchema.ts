import { EntitySchema } from "@mikro-orm/core";
import AppRole from "../../domain/application/AppRole.js";

export default new EntitySchema<AppRole>({
    class: AppRole,
    properties: {
        name: { type: 'string', nullable: false, length: 100, primary: true }
    }
})