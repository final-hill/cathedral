import { type Properties } from "../Properties";
import { type Uuid } from "../Uuid";
import ValueObject from "../ValueObject";

export default class AppUserOrganizationRole extends ValueObject {
    constructor({ appuserId, organizationId, roleId }: Properties<AppUserOrganizationRole>) {
        super()
        this.appuserId = appuserId
        this.organizationId = organizationId
        this.roleId = roleId
    }

    appuserId: Uuid
    organizationId: Uuid
    roleId: Uuid

    toJSON() {
        return {
            appuserId: this.appuserId,
            organizationId: this.organizationId,
            roleId: this.roleId
        }
    }
}