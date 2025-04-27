import { Collection, Entity, ManyToMany, Property, types } from "@mikro-orm/core";
import { MetaRequirementModel, MetaRequirementVersionsModel } from './MetaRequirementModel.js';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { AppUserModel } from "../application/AppUserModel.js";

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends MetaRequirementModel {
    @ManyToMany({ entity: () => AppUserModel, mappedBy: (o) => o.organizations })
    readonly users = new Collection<AppUserModel>(this);
}

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends MetaRequirementVersionsModel {
    @Property({ type: types.string })
    readonly slug!: string
}