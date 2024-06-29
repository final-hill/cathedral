import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import Person from "../domain/Person";

export default class PersonRepository extends PGLiteEntityRepository<Person> {
    constructor() { super('cathedral.person', Person) }
}