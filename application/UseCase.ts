export default abstract class UseCase<T, U> {
    abstract execute(input: T): Promise<U>
}