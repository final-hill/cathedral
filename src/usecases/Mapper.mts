import type { SemVerString } from '~/lib/SemVer.mjs';

export default abstract class Mapper<Source, Target> {
    constructor(readonly serializationVersion: SemVerString) { }
    abstract mapTo(source: Source): Target;
    abstract mapFrom(target: Target): Source;
}