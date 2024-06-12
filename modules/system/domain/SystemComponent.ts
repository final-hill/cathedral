import Component from "~/domain/Component";
import type { Properties } from "~/domain/Properties";
import type { Uuid } from "~/domain/Uuid";

export default class SystemComponent extends Component {
    constructor({ systemId, ...rest }: Properties<SystemComponent>) {
        super(rest)

        this.systemId = systemId
    }

    systemId: Uuid
}