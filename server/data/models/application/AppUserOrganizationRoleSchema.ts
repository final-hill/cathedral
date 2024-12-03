import { EntitySchema } from "@mikro-orm/core";
import { AppUserOrganizationRole, AppRole } from "../../../../domain/application/index.js";

export const AppUserOrganizationRoleSchema = new EntitySchema<AppUserOrganizationRole>({
    class: AppUserOrganizationRole,
    properties: {
        appUser: { kind: 'm:1', primary: true, entity: 'AppUser' },
        organization: { kind: 'm:1', primary: true, entity: 'Organization' },
        role: { enum: true, primary: true, items: () => AppRole }
    }
})