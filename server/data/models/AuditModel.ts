import { type Collection, type FilterQuery, ManyToOne, type OrderDefinition, PrimaryKey, Property, type Rel, types } from "@mikro-orm/core"
import { AppUserModel } from "./index.js"

export abstract class StaticAuditModel<V extends VolatileAuditModel> {
    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: Rel<AppUserModel>;

    @Property({ type: types.datetime })
    readonly creationDate!: Date;

    abstract readonly versions: Collection<V, object>;

    async getLatestVersion(effectiveDate: Date, filter: FilterQuery<V> = {}): Promise<V | undefined> {
        const latestVersion = (await this.versions.matching({
            where: { effectiveFrom: { $lte: effectiveDate }, ...filter } as FilterQuery<V>,
            orderBy: { effectiveFrom: 'desc' } as OrderDefinition<V>,
            limit: 1,
            // @ts-ignore
            populate: ['*']
        }))[0]

        return latestVersion && !latestVersion.isDeleted ? latestVersion : undefined
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