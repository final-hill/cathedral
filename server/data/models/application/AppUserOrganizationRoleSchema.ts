import { EntitySchema } from "@mikro-orm/core";
import AppUserOrganizationRole from "../../../domain/application/AppUserOrganizationRole.js";
import AppRole from "../../../domain/application/AppRole.js";

export default new EntitySchema<AppUserOrganizationRole>({
    class: AppUserOrganizationRole,
    properties: {
        appUser: {
            kind: 'm:1',
            entity: 'AppUser',
            primary: true
        },
        organization: {
            kind: 'm:1',
            entity: 'Organization',
            primary: true
        },
        role: {
            enum: true,
            items: () => AppRole,
            default: AppRole.ORGANIZATION_READER,
            primary: true
        }
    }
})