import { PegsCards } from "~components/index.mjs";
import html from "../../lib/html.mjs";
import Page from "../Page.mjs";
import { EnvironmentRepository } from "~/data/EnvironmentRepository.mjs";

const { p } = html

export class Environments extends Page {
    static {
        customElements.define('x-environments-page', this)
    }

    constructor() {
        super({ title: 'Environments' }, [
            p(`
                An environment is the set of entities (people, organizations, regulations,
                devices and other material objects, other systems) external to the project
                or system but with the potential to affect it or be affected by it.
            `),
            new PegsCards({
                repository: new EnvironmentRepository()
            }, [])
        ])
    }
}