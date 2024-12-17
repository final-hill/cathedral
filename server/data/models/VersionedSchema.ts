import { Property } from "@mikro-orm/core"

export abstract class VersionedModel {
    // constructor(props: Pick<VersionedModel, 'effectiveFrom' | 'deleted'>) {
    //     Object.assign(this, props);
    // }

    @Property({ primary: true })
    readonly effectiveFrom!: Date

    @Property()
    readonly deleted!: boolean
}