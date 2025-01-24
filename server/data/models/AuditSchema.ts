import { ManyToOne, Property } from "@mikro-orm/core"
import { AppUserModel } from "./index.js"

export abstract class StaticAuditModel {
    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: AppUserModel;

    @Property()
    readonly creationDate!: Date;
}

export abstract class VolatileAuditModel {
    @Property({ primary: true })
    readonly effectiveFrom!: Date

    @Property()
    readonly isDeleted!: boolean

    @ManyToOne({ entity: () => AppUserModel })
    readonly modifiedBy!: AppUserModel;
}