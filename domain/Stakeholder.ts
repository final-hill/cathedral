import { Entity } from "./Entity";

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

export interface StakeholderOpts {
    id?: string;
    name: string;
    description: string;
    category: StakeholderCategory;
    segmentation: StakeholderSegmentation;
}

/**
 * A Stakeholder is an individual or group that can affect or
 * be affected by a Project, Environment, Goals, or System
 * @see Project
 * @see Environment
 * @see Goals
 * @see System
 */
export class Stakeholder extends Entity<string> {
    private _id;
    private _name;
    private _description;
    private _category;
    private _segmentation;

    constructor(options: StakeholderOpts) {
        super();
        this._id = options.id ?? crypto.randomUUID();
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

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get segmentation(): StakeholderSegmentation {
        return this._segmentation;
    }
}