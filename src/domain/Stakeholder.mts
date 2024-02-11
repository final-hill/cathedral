import type { Properties } from '~/types/Properties.mjs';
import { Entity } from './index.mjs';

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

export class Stakeholder extends Entity {
    description!: string;
    name!: string;
    segmentation!: StakeholderSegmentation;

    #influence!: number;
    #availability!: number;

    constructor({ id, ...rest }: Omit<Properties<Stakeholder>, 'category'>) {
        super({ id });
        Object.assign(this, rest);
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
        const { KeyStakeholder, ShadowInfluencer, FellowTraveler, Observer } = StakeholderCategory,
            { influence, availability } = this;

        return influence >= 75 && availability >= 75 ? KeyStakeholder
            : influence >= 75 && availability < 75 ? ShadowInfluencer
                : influence < 75 && availability >= 75 ? FellowTraveler
                    : Observer;
    }
}