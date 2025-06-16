import { Entity, ManyToOne, PrimaryKey, Property, type Rel, types } from "@mikro-orm/core";
import { AppUserModel } from "./AppUserModel.js";

@Entity({ tableName: 'slack_user_meta' })
export class SlackUserMetaModel {
    @PrimaryKey({ type: types.string })
    slackUserId!: string;

    @PrimaryKey({ type: types.string })
    teamId!: string;

    @ManyToOne({ entity: () => AppUserModel })
    appUser!: Rel<AppUserModel>;

    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: Rel<AppUserModel>;

    @Property({ type: types.datetime })
    creationDate!: Date;
}