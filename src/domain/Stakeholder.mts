import type { Properties } from '~/types/Properties.mjs';
import Entity from './Entity.mjs';

export enum StakeholderSegmentation {
    Client = 'Client',
    Vendor = 'Vendor'
}

export enum StakeholderCategory {
    KeyStakeholder = 'Key Stakeholder',
    ShadowInfluencer = 'Shadow Influencer',
    FellowTraveler = 'Fellow Traveler',
    Observer = 'Observer'
}

export default class Stakeholder extends Entity {
    description: string;
    name: string;
    segmentation: StakeholderSegmentation;
    #influence!: number;
    #availability!: number;

    constructor(properties: Omit<Properties<Stakeholder>, 'category'>) {
        super({ id: properties.id });
        this.description = properties.description;
        this.name = properties.name;
        this.segmentation = properties.segmentation;
        this.influence = properties.influence;
        this.availability = properties.availability;
    }

    get influence() {
        return this.#influence;
    }

    set influence(value) {
        if (value < 0 || value > 100)
            throw new Error('Invalid value for influence. Must be between 0 and 100.');

        this.#influence = value;
    }

    get availability() {
        return this.#availability;
    }

    set availability(value) {
        if (value < 0 || value > 100)
            throw new Error('Invalid value for availability. Must be between 0 and 100.');
        this.#availability = value;
    }

    get category(): StakeholderCategory {
        if (this.influence >= 75 && this.availability >= 75)
            return StakeholderCategory.KeyStakeholder;
        if (this.influence >= 75 && this.availability < 75)
            return StakeholderCategory.ShadowInfluencer;
        if (this.influence < 75 && this.availability >= 75)
            return StakeholderCategory.FellowTraveler;

        return StakeholderCategory.Observer;
    }
}