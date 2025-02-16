import { Collection, type FilterQuery, ManyToOne, PrimaryKey, Property, type QueryOrderMap, type Rel, types } from "@mikro-orm/core"
import { AppUserModel } from "./index.js"

export abstract class StaticAuditModel<V extends VolatileAuditModel> {
    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: Rel<AppUserModel>;

    @Property({ type: types.datetime })
    readonly creationDate!: Date;

    abstract readonly versions: Collection<V, object>;

    /**
     * The latest version of the requirement (effective_from <= now())
     */
    get latestVersion(): Promise<V | undefined> {
        return this.versions.loadItems({
            where: {
                effectiveFrom: { $lte: new Date() }
            } as FilterQuery<V>,
            orderBy: {
                effectiveFrom: 'desc'
            } as QueryOrderMap<V>,
        }).then(items => items[0].isDeleted ? undefined : items[0])
    }
}

export abstract class VolatileAuditModel {
    @PrimaryKey({ type: types.datetime })
    readonly effectiveFrom!: Date

    @Property({ type: types.boolean })
    readonly isDeleted!: boolean

    @ManyToOne({ entity: () => AppUserModel })
    readonly modifiedBy!: Rel<AppUserModel>;
}