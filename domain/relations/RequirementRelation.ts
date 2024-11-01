import { v7 as uuidv7 } from 'uuid';
import { BaseEntity, Cascade, Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Requirement } from '../requirements/Requirement.js'
import { type Properties } from '../types/index.js';

/**
 * Relations between requirements
 */
@Entity({ abstract: true, discriminatorColumn: 'rel_type' })
export abstract class RequirementRelation extends BaseEntity {
    constructor(props: Properties<Omit<RequirementRelation, 'id'>>) {
        super()
        this.id = uuidv7();
        this.left = props.left;
        this.right = props.right;
    }

    /**
     * The unique identifier of the RequirementRelation
     */
    @Property({ type: 'uuid', primary: true })
    id: string;

    /**
     * The left-hand side of the relation
     */
    @ManyToOne({ entity: () => Requirement, cascade: [Cascade.REMOVE] })
    left: Requirement

    /**
     * The right-hand side of the relation
     */
    @ManyToOne({ entity: () => Requirement, cascade: [Cascade.REMOVE] })
    right: Requirement
}