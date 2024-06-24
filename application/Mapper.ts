export default abstract class Mapper<Source, Target> {
    abstract mapTo(source: Source): Target;
    abstract mapFrom(target: Target): Source;
}