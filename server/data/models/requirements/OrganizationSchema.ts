import { Entity, Property } from "@mikro-orm/core";
import { Organization, ReqType } from '../../../../domain/requirements/index.js';
import { RequirementModel, RequirementVersionsModel } from "./RequirementSchema.js";

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationModel extends RequirementModel { }

@Entity({ discriminatorValue: ReqType.ORGANIZATION })
export class OrganizationVersionsModel extends RequirementVersionsModel {
    declare readonly requirement: OrganizationModel
    @Property({ type: 'string' })
    readonly slug!: Organization['slug'];
}