import { Entity, Property, types } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ActorModel, ActorVersionsModel } from './ActorModel.js';

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonModel extends ActorModel { }

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonVersionsModel extends ActorVersionsModel {
    @Property({ length: 254, type: types.string })
    readonly email!: string
}