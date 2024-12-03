import { EntitySchema } from "@mikro-orm/core";
import { TestCase, Example, ReqType } from '../../../../domain/requirements/index.js';

export const TestCaseSchema = new EntitySchema<TestCase, Example>({
    class: TestCase,
    discriminatorValue: ReqType.TEST_CASE
})