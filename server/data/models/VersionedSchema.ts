import { Property } from "@mikro-orm/core"

export abstract class VersionedModel {
    @Property({ primary: true })
    readonly effectiveFrom!: Date

    @Property()
    readonly deleted!: boolean
}