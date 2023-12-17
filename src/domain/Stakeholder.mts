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
}