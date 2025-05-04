import { Entity, ManyToOne, Property, types } from "@mikro-orm/core";
import { AppUserModel } from "./AppUserModel.js";

@Entity({ tableName: 'app_credentials' })
export class AppCredentialsModel {
    @Property({ type: types.string, primary: true, length: 1023 })
    readonly id!: string;

    @ManyToOne({ entity: () => AppUserModel, primary: true })
    readonly appUser!: AppUserModel;

    @Property({ type: types.string, length: 512 })
    readonly publicKey!: string;

    @Property({ type: types.integer })
    readonly counter!: number;

    @Property({ type: types.boolean })
    readonly backedUp!: boolean;

    @Property({ type: types.json, nullable: true })
    readonly transports?: string[];
}