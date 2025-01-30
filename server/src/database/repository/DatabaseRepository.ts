import IBotDataDocument from "../../models/IBotDataDocument";

/**
 * A generic database repository class that abstracts queries from the rest of the application.
 * Decouples database logic from business logic, enables easy swapping between database technologies,
 * and makes testing easy
 */
export abstract class DatabaseRepository<T> {
    abstract create(data: T): Promise<T>;
    abstract findById(id: string): Promise<T>;
    abstract update(data: T): Promise<T | null>;
    abstract delete(id: string): Promise<T>;
}
