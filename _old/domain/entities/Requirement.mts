// import { Contract, Contracted, implies, invariant } from '@final-hill/decorator-contracts';
import { type Predicate } from './Predicate.mjs';

// const requirementContract = new Contract<Requirement>({
//     [invariant]: self => implies(
//         self.project != undefined, Boolean(self.project?.requirements.includes(self))
//     )
// });

/**
 * A Requirement is a specification of a particular system property.
 * A relevant Property of a Project, Environment, Goal, or System
 *
 * A Requirement is a singular documented physical or functional
 *  need that a particular design, product or process aims to satisfy
 *
 * homogeneous if the property combines properties of a similar nature, and heterogeneous otherwise.
 *
 %% SubRequirements
 */
// @Contracted(requirementContract)
export default class Requirement {
    private _belongsTo?: Requirement;
    private _characterizes?: Requirement;
    private _constrains?: Requirement;
    private _contradicts?: Requirement;
    private _details?: Requirement;
    private _disjoins?: Requirement;
    private _duplicates?: Requirement;
    private _excepts?: Requirement;
    private _explains?: Requirement;
    private _extends?: Requirement;
    private _follows?: Requirement;
    private _id?: string; // UUID?
    private _composite = false;
    private _isRelevant = false;
    private _wellFormed = false;
    private _project?: Project;
    private _property: Predicate = () => true;
    private _repeats?: Requirement;
    private _shares?: Requirement;
    private _statement?: string;

    /**
     *
     */
    get id(): string | undefined { return this._id; }

    /**
     * A property of a project or system is relevant if it can affect or be affected by a stakeholder.
     * A property of the environment is relevant if it can affect or be affected by the project or system.
     */
    get isRelevant() { return this._isRelevant; }

    /**
     *
     */
    get belongsTo(): Requirement | undefined { return this._belongsTo; }

    /**
     *
     */
    get characterizes(): Requirement | undefined { return this._characterizes; }

    /**
     *
     */
    get constrains(): Requirement | undefined { return this._constrains; }

    /**
     *
     */
    get contradicts(): Requirement | undefined { return this._contradicts; }

    /**
     *
     */
    get details(): Requirement | undefined { return this._details; }

    /**
     *
     */
    get disjoins(): Requirement | undefined { return this._disjoins; }

    /**
     *
     */
    get duplicates(): Requirement | undefined { return this._duplicates; }

    /**
     *
     */
    get excepts(): Requirement | undefined { return this._excepts; }

    /**
     *
     */
    get extends(): Requirement | undefined { return this._extends; }

    /**
     *
     */
    get explains(): Requirement | undefined { return this._explains; }

    /**
     *
     */
    get follows(): Requirement | undefined { return this._follows; }

    /**
     * Requirement/property is a compound expression
     */
    get composite(): boolean { return this._composite; }

    /**
     * this.statement translatesTo this.property
     */
    get wellFormed(): boolean { return this._wellFormed; }

    /**
     *
     */
    get project(): Project | undefined { return this._project; }

    /**
     * A formal, declarative sentence that is either true or false. A Predicate.
     */
    get property(): Predicate { return this._property; }

    /**
     *
     */
    get repeats(): Requirement | undefined { return this._repeats; }

    /**
     *
     */
    get shares(): Requirement | undefined { return this._shares; }

    /**
     * A human readable expression of a property.
     * A statement 'specifies' a property
     */
    get statement(): string | undefined { return this._statement; }
}