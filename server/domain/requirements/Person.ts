import { Actor, ParsedRequirement } from "./index.js";

/**
 * A person is a member of the Project staff
 */
export class Person extends Actor {
    constructor({ email, follows, ...rest }: Omit<Person, 'id'>) {
        super(rest);
        this.email = email;
        this.follows = follows;
    }

    /**
     * Email address of the person
     */
    email?: string;

    /**
     * Requirement that this person follows from
     */
    follows?: ParsedRequirement;
}
