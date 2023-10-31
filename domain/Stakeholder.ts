import { Entity, type EntityJson } from "./Entity";
import type { Properties } from "./types/Properties";

export interface StakeholderJson extends EntityJson {
    category: StakeholderCategory;
    description: string;
    name: string;
    segmentation: StakeholderSegmentation;
}

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
    static override fromJSON(json: StakeholderJson): Stakeholder {
        return new Stakeholder({
            category: json.category,
            description: json.description,
            id: json.id,
            name: json.name,
            segmentation: json.segmentation
        })
    }

    constructor(options: Properties<Stakeholder>) {
        super(options);
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.segmentation = options.segmentation;
    }

    category: StakeholderCategory;
    description: string
    name: string
    segmentation: StakeholderSegmentation

    toJSON(): StakeholderJson {
        return {
            ...super.toJSON(),
            category: this.category,
            description: this.description,
            name: this.name,
            segmentation: this.segmentation
        }
    }
}