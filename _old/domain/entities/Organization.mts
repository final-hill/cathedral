import Project from './Project.mjs';

/**
 * An Organization manages projects and more
 */
export default class Organization {
    private _name: string;
    private _icon: URL;
    private _description: string;
    private _projects: Project[] = [];

    constructor(options: { name: string; icon: URL; description: string }) {
        this._name = options.name;
        this._icon = options.icon;
        this._description = options.description;
    }

    get name(): string { return this._name; }
    set name(value: string) { this._name = value; }

    get description(): string { return this._description; }
    set description(value: string) { this._description = value; }

    get icon(): URL { return this._icon; }
    set icon(value: URL) { this._icon = value; }

    get projects(): Project[] { return [...this._projects]; }
}