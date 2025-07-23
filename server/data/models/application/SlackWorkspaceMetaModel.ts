import { Entity, ManyToOne, PrimaryKey, Property, types } from '@mikro-orm/core'
import type { Rel } from '@mikro-orm/core'
import { OrganizationModel } from '../requirements/index.js'

@Entity({ tableName: 'slack_workspace_meta' })
export class SlackWorkspaceMetaModel {
    @PrimaryKey({ type: types.string })
    teamId!: string

    @Property({ type: types.string })
    teamName!: string

    @ManyToOne({ entity: () => OrganizationModel })
    organization!: Rel<OrganizationModel>

    @Property({ type: types.text })
    accessToken!: string

    @Property({ type: types.string })
    botUserId!: string

    @Property({ type: types.text })
    scope!: string

    @Property({ type: types.string })
    appId!: string

    @Property({ type: types.string, length: 766 })
    readonly installedById!: string

    @Property({ type: types.datetime })
    installationDate!: Date

    @Property({ type: types.datetime, nullable: true })
    lastRefreshDate?: Date
}
