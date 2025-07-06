import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property, types } from '@mikro-orm/core'
import { AppCredentialsModel, AppUserOrganizationRoleModel, OrganizationModel } from '../index.js'
import { SlackUserMetaModel } from './SlackUserMetaModel.js'

@Entity({ tableName: 'app_user' })
export class AppUserModel {
    @Property({ type: types.uuid, primary: true })
    readonly id!: string

    @ManyToMany({ entity: () => OrganizationModel, owner: true, pivotEntity: () => AppUserOrganizationRoleModel })
    readonly organizations = new Collection<OrganizationModel>(this)

    @ManyToOne({ entity: () => AppUserModel })
    readonly createdBy!: AppUserModel

    @Property({ type: types.datetime })
    readonly creationDate!: Date

    @ManyToOne({ entity: () => AppUserModel })
    readonly modifiedBy!: AppUserModel

    @Property({ type: types.string, length: 254 })
    readonly name!: string

    @Property({ type: types.string, length: 254, unique: true })
    readonly email!: string

    @Property({ type: types.datetime, nullable: true })
    readonly lastLoginDate?: Date

    @Property({ type: types.datetime, nullable: true })
    readonly lastModified?: Date

    @Property({ type: types.boolean })
    readonly isSystemAdmin!: boolean

    @OneToMany({ entity: () => AppCredentialsModel, mappedBy: 'appUser' })
    credentials = new Collection<AppCredentialsModel>(this)

    @OneToMany({ entity: () => SlackUserMetaModel, mappedBy: 'appUser' })
    slackUserMeta = new Collection<SlackUserMetaModel>(this)
}
