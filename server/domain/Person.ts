import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Actor } from "./Actor.js";
import { ParsedRequirement } from "./ParsedRequirement.js";

/**
 * A person is a member of the Project staff
 */
@Entity()
export class Person extends Actor {
    constructor({ email, follows, ...rest }: Omit<Person, 'id'>) {
        super(rest);
        this.email = email;
        this.follows = follows;
    }

    /**
     * Email address of the person
     */
    // email address: https://stackoverflow.com/a/574698
    @Property({ type: 'string', length: 254 })
    email?: string;

    /**
     * Requirement that this person follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement })
    follows?: ParsedRequirement;
}