import Interactor from "~/server/application/Interactor";
import Component from "~/server/domain/requirements/Component";
import Repository from "./Repository";

export default class ComponentInteractor extends Interactor<Component> {
    constructor(repository: Repository<Component>) {
        super(repository, Component)
    }
}