import PGLiteRepository from "~/data/PGLiteRepository";
import Person from "../domain/Person";

export default class PersonRepository extends PGLiteRepository<Person> {
    constructor() { super('cathedral.person', Person) }
}