import { EntitySchema } from "@mikro-orm/core";
import AppUserSystemAdminRole from "../../domain/application/AppUserSystemAdminRole.js";

export default new EntitySchema<AppUserSystemAdminRole>({
    class: AppUserSystemAdminRole,
    properties: {
        appUserId: {
            type: 'uuid',
            primary: true
        }
    }
})