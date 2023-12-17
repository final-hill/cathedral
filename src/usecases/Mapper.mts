export default abstract class Mapper<Source, Target> {
    constructor(readonly serializationVersion: string) { }
    abstract mapTo(source: Source): Target;
    abstract mapFrom(target: Target): Source;
}