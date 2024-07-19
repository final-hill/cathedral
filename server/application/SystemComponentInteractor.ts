import Interactor from "~/server/application/Interactor";
import Repository from "./Repository";
import SystemComponent from "../domain/requirements/SystemComponent";

export default class SystemComponentInteractor extends Interactor<SystemComponent> {
    constructor(repository: Repository<SystemComponent>) {
        super(repository, SystemComponent)
    }
}