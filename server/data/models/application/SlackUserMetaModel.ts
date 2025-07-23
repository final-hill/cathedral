import { Entity, PrimaryKey, Property, types } from '@mikro-orm/core'

@Entity({ tableName: 'slack_user_meta' })
export class SlackUserMetaModel {
    @PrimaryKey({ type: types.string })
    slackUserId!: string

    @PrimaryKey({ type: types.string })
    teamId!: string

    @Property({ type: types.string, length: 766 })
    appUserId!: string

    @Property({ type: types.string, length: 766 })
    readonly createdById!: string

    @Property({ type: types.datetime })
    creationDate!: Date
}
