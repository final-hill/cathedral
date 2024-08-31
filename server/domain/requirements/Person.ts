import { type Properties } from "../Properties.js";
import { Actor } from "./index.js";

/**
 * A person is a member of the Project staff
 */
export class Person extends Actor {
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