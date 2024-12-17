import { Entity, Property } from '@mikro-orm/core';
import { ReqType } from '../../../../domain/requirements/index.js';
import { ActorModel, ActorVersionsModel } from './ActorSchema.js';

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonModel extends ActorModel { }

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonVersionsModel extends ActorVersionsModel {
    @Property({ length: 254 })
    readonly email!: string
}