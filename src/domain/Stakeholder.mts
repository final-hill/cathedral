import type { Properties } from "~/types/Properties.mjs";
import { Entity, type EntityJson } from "./Entity.mjs";

export interface StakeholderJson extends EntityJson {
    category: string;
    description: string;
    name: string;
    segmentation: string;
};

export enum StakeholderSegmentation {
    Client = "Client",
    Vendor = "Vendor"
}

export enum StakeholderCategory {
    UNCATEGORIZED = 'Uncategorized',
    KEY_STAKEHOLDER = 'Key Stakeholder',
    SHADOW_INFLUENCER = 'Shadow Influencer',
    FELLOW_TRAVELER = 'Fellow Traveler',
    OBSERVER = 'Observer'
}

export class Stakeholder extends Entity {
    category: StakeholderCategory;
    description: string;
    name: string;
    segmentation: StakeholderSegmentation;

    constructor({ id, category, description, name, segmentation }: Properties<Stakeholder>) {
        super({ id });
        this.category = category;
        this.description = description;
        this.name = name;
        this.segmentation = segmentation;
    }

    static override fromJSON({ id, category, description, name, segmentation }: StakeholderJson): Stakeholder {
        return new Stakeholder({
            category: category as StakeholderCategory,
            description,
            id,
            name,
            segmentation: segmentation as StakeholderSegmentation
        });
    }

    override toJSON(): StakeholderJson {
        return {
            ...super.toJSON(),
            category: this.category,
            description: this.description,
            name: this.name,
            segmentation: this.segmentation
        };
    }
}