import { ManyToOne, PrimaryKey, Property, type Rel, types } from "@mikro-orm/core"
import { AppUserModel } from "./index.js"

export abstract class StaticAuditModel {
    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: Rel<AppUserModel>;

    @Property({ type: types.datetime })
    readonly creationDate!: Date;
}

export abstract class VolatileAuditModel {
    @PrimaryKey({ type: types.datetime })
    readonly effectiveFrom!: Date

    @Property({ type: types.boolean })
    readonly isDeleted!: boolean

    @ManyToOne({ entity: () => AppUserModel })
    readonly modifiedBy!: Rel<AppUserModel>;
}