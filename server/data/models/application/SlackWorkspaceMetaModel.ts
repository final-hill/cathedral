import { Entity, ManyToOne, PrimaryKey, Property, type Rel, types } from "@mikro-orm/core";
import { OrganizationModel } from "../requirements/index.js";
import { AppUserModel } from "../index.js";

@Entity({ tableName: 'slack_workspace_meta' })
export class SlackWorkspaceMetaModel {
    @PrimaryKey({ type: types.string })
    teamId!: string;

    @Property({ type: types.string })
    teamName!: string;

    @ManyToOne({ entity: () => OrganizationModel })
    organization!: Rel<OrganizationModel>;

    @Property({ type: types.text })
    accessToken!: string;

    @Property({ type: types.string })
    botUserId!: string;

    @Property({ type: types.text })
    scope!: string;

    @Property({ type: types.string })
    appId!: string;

    @ManyToOne({ entity: () => AppUserModel })
    readonly installedBy!: Rel<AppUserModel>;

    @Property({ type: types.datetime })
    installationDate!: Date;

    @Property({ type: types.datetime, nullable: true })
    lastRefreshDate?: Date;
}
