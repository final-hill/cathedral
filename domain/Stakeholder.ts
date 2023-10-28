import { Entity } from "./Entity";
import type { Properties } from "./types/Properties";

export enum StakeholderSegmentation {
    Client = "Client",
    Vndor = "Vendor"
}

export enum StakeholderCategory {
    UNCATEGORIZED = 'Uncategorized',
    KEY_STAKEHOLDER = 'Key Stakeholder',
    SHADOW_INFLUENCER = 'Shadow Influencer',
    FELLOW_TRAVELER = 'Fellow Traveler',
    OBSERVER = 'Observer'
}

/**
 * A Stakeholder is an individual or group that can affect or
 * be affected by a Project, Environment, Goals, or System
 * @see Project
 * @see Environment
 * @see Goals
 * @see System
 */
export class Stakeholder extends Entity {
    static override fromJSON(json: any): Stakeholder {
        return new Stakeholder({
            category: json.category,
            description: json.description,
            id: json.id,
            name: json.name,
            segmentation: json.segmentation
        })
    }

    private _name;
    private _description;
    private _category;
    private _segmentation;

    constructor(options: Properties<Stakeholder>) {
        super(options);
        this._name = options.name;
        this._description = options.description;
        this._category = options.category;
        this._segmentation = options.segmentation;
    }

    get category(): StakeholderCategory {
        return this._category;
    }

    get description(): string {
        return this._description;
    }

    get name(): string {
        return this._name;
    }

    get segmentation(): StakeholderSegmentation {
        return this._segmentation;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            category: this._category,
            description: this._description,
            name: this._name,
            segmentation: this._segmentation
        }
    }
}