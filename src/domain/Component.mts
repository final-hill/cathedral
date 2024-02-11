import type { Properties } from '~/types/Properties.mjs';
import { Requirement, type Tree } from './index.mjs';

/**
 * A Component is a self-contained element that provides an interface
 * which can be utilized by the Project, Environment, Goals, or System.
 * A component can be composed of other components, forming a tree structure.
 */
export class Component extends Requirement implements Tree {
    static maxNameLength = 120;

    #name!: string;
    children!: this[];

    constructor({ name, children, ...rest }: Properties<Component>) {
        super(rest);
        Object.assign(this, { name, children });
    }

    get name() { return this.#name; }
    set name(value) {
        if (value.length > Component.maxNameLength)
            throw new Error(`Name exceeds maximum length of ${Component.maxNameLength} characters.`);
        this.#name = value.trim();
    }
}