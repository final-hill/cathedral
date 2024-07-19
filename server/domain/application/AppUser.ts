import Entity from "../Entity";
import { type Properties } from "../Properties";

export default class AppUser extends Entity<string> {
    constructor({ id, ...rest }: Properties<AppUser>) {
        super({ id });
        this.defaultOrganizationId = rest.defaultOrganizationId;
        this.creationDate = rest.creationDate;
    }

    creationDate: Date;
    defaultOrganizationId: string;

    toJSON() {
        return {
            ...super.toJSON(),
            defaultOrganizationId: this.defaultOrganizationId,
            creationDate: this.creationDate.toISOString()
        }
    }
}