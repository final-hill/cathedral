import type { Properties } from '~/types/Properties.mjs';
import Requirement from './Requirement.mjs';

/**
 * A Component is a self-contained element in the Environment that provides an interface
 * which can be used by a System to interact with.
 */
export default class Component extends Requirement {
    name: string;
    description: string;

    constructor(properties: Omit<Properties<Component>, 'interfaceDefinition'>) {
        super(properties);

        this.name = properties.name;
        this.description = properties.description;
    }

    get interfaceDefinition(): string {
        return this.statement;
    }

    set interfaceDefinition(value: string) {
        this.statement = value;
    }
}