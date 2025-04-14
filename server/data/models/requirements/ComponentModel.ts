import { Entity, ManyToOne, type Ref } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ActorModel, ActorVersionsModel } from "./ActorModel.js";

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentModel extends ActorModel { }

@Entity({ discriminatorValue: ReqType.COMPONENT })
export class ComponentVersionsModel extends ActorVersionsModel {
    /**
     * The parent component that this component belongs to
     */
    @ManyToOne({ entity: () => ComponentVersionsModel, nullable: true })
    readonly parentComponent?: Ref<ComponentModel>;
}