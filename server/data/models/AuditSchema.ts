import { ManyToOne, Property, type Rel } from "@mikro-orm/core"
import { AppUserModel } from "./index.js"

export abstract class StaticAuditModel {
    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: Rel<AppUserModel>;

    @Property()
    readonly creationDate!: Date;
}

export abstract class VolatileAuditModel {
    @Property({ primary: true })
    readonly effectiveFrom!: Date

    @Property()
    readonly isDeleted!: boolean

    @ManyToOne({ entity: () => AppUserModel })
    readonly modifiedBy!: Rel<AppUserModel>;
}