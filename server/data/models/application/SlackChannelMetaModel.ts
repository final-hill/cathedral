import { Entity, ManyToOne, PrimaryKey, Property, types } from '@mikro-orm/core'
import type { Rel } from '@mikro-orm/core'
import { SolutionModel } from '../requirements/index.js'

@Entity({ tableName: 'slack_channel_meta' })
export class SlackChannelMetaModel {
    @PrimaryKey({ type: types.string })
    channelId!: string

    @Property({ type: types.string })
    channelName!: string

    @PrimaryKey({ type: types.string })
    teamId!: string

    @Property({ type: types.string })
    teamName!: string

    @ManyToOne({ entity: () => SolutionModel })
    solution!: Rel<SolutionModel>

    @Property({ type: types.string, length: 766 })
    readonly createdById!: string

    @Property({ type: types.datetime })
    creationDate!: Date

    @Property({ type: types.datetime, nullable: true })
    lastNameRefresh?: Date
}
