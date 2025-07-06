export interface Mapper<From, To> {
    map(from: From): Promise<To>
}
