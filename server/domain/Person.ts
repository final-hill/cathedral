import { Entity, Property } from "@mikro-orm/core";
import Actor from "./Actor.js";
import { type Properties } from "./Properties.js";

@Entity()
export default class Person extends Actor {
    constructor({ email, ...rest }: Omit<Properties<Person>, 'id'>) {
        super(rest);

        this.email = email;
    }

    @Property()
    email: string;
}