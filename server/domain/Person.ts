import Actor from "./Actor.js";
import { type Properties } from "./Properties.js";

/**
 *  A person is a member of the Project staff
 */
export default class Person extends Actor {
    constructor({ email, ...rest }: Omit<Properties<Person>, 'id'>) {
        super(rest);

        this.email = email;
    }

    email: string;

    override toJSON() {
        return {
            ...super.toJSON(),
            email: this.email
        };
    }
}