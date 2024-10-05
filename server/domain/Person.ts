import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Actor, ParsedRequirement } from "./index.js";

/**
 * A person is a member of the Project staff
 */
@Entity()
class Person extends Actor {
    constructor({ email, follows, ...rest }: Omit<Person, 'id' | 'sysPeriod'>) {
        super(rest);
        this.email = email;
        this.follows = follows;
    }

    /**
     * Email address of the person
     */
    // email address: https://stackoverflow.com/a/574698
    @Property({ type: 'string', length: 254, nullable: true })
    email?: string;

    /**
     * Requirement that this person follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement, nullable: true })
    follows?: ParsedRequirement;
}

export { Person };