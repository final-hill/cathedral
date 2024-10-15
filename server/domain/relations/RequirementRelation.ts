import { v7 as uuidv7 } from 'uuid';
import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { Requirement } from '../Requirement.js'

/**
 * Abstract class for relations between requirements
 */
@Entity({ abstract: true, discriminatorColumn: 'rel_type' })
export abstract class RequirementRelation {
    constructor(props: Omit<RequirementRelation, 'id'>) {
        this.id = uuidv7();
        this.left = props.left;
        this.right = props.right;
    }

    /**
     * The unique identifier of the RequirementRelation
     */
    @Property({ type: 'uuid', primary: true })
    id: string;

    @OneToOne({ entity: () => Requirement })
    left: Requirement

    @OneToOne({ entity: () => Requirement })
    right: Requirement
}