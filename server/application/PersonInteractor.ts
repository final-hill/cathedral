import Interactor from "~/server/application/Interactor";
import Person from "~/server/domain/requirements/Person";
import Repository from "./Repository";

export default class PersonInteractor extends Interactor<Person> {
    constructor(repository: Repository<Person>) {
        super(repository, Person)
    }
}