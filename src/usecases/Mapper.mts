export interface Mapper<From, To> {
    mapFrom(from: From): To;
    mapTo(to: To): From;
}