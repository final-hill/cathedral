// This file is referenced by the application as well as the migration CLI
// The CLI use case requires the direct and indirect imports to have a .js extension.
// Additionally, the imports can not use '~'
import dotenv from "dotenv";
import { type Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import Solution from './server/domain/Solution.js';
import Actor from "./server/domain/Actor.js";
import Assumption from "./server/domain/Assumption.js";
import Constraint from "./server/domain/Constraint.js";
import Effect from "./server/domain/Effect.js";
import EnvironmentComponent from "./server/domain/EnvironmentComponent.js";
import FunctionalBehavior from "./server/domain/FunctionalBehavior.js";
import GlossaryTerm from "./server/domain/GlossaryTerm.js";
import Justification from "./server/domain/Justification.js";
import Hint from "./server/domain/Hint.js";
import Invariant from "./server/domain/Invariant.js";
import Limit from "./server/domain/Limit.js";
import NonFunctionalBehavior from "./server/domain/NonFunctionalBehavior.js";
import Obstacle from "./server/domain/Obstacle.js";
import Outcome from "./server/domain/Outcome.js";
import Person from "./server/domain/Person.js";
import Product from "./server/domain/Product.js";
import Stakeholder from "./server/domain/Stakeholder.js";
import UseCase from "./server/domain/UseCase.js";
import UserStory from "./server/domain/UserStory.js";

dotenv.config();

const config: Options = {
    extensions: [Migrator],
    driver: PostgreSqlDriver,
    dbName: process.env.POSTGRES_DB!,
    user: process.env.POSTGRES_USER!,
    host: process.env.POSTGRES_HOST!,
    password: process.env.POSTGRES_PASSWORD!,
    port: parseInt(process.env.POSTGRES_PORT!),
    entities: [
        Solution, Actor, Assumption, Constraint, Effect, EnvironmentComponent,
        FunctionalBehavior, GlossaryTerm, Justification, Hint, Invariant, Limit,
        NonFunctionalBehavior, Obstacle, Outcome, Person, Product, Stakeholder,
        UseCase, UserStory
    ],
    forceUtcTimezone: true,
    // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
    // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
    metadataProvider: TsMorphMetadataProvider,
    debug: process.env.NODE_ENV !== 'production',
    migrations: {
        transactional: true
    }
};

export default config;