import { Collection, Entity, Property, types } from '@mikro-orm/core';
import { ReqType } from "./ReqType.js";
import { ActorModel, ActorVersionsModel } from './ActorSchema.js';

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonModel extends ActorModel {
    declare readonly versions: Collection<PersonVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.PERSON })
export class PersonVersionsModel extends ActorVersionsModel {
    @Property({ length: 254, type: types.string })
    readonly email!: string
}