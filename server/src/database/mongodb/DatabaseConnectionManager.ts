import {Collection, MongoClient, ServerApiVersion} from "mongodb";

export default class DatabaseConnectionManager {
    database_username: string;
    database_password: string;
    database_connection_string: string;
    database_connection_maximum_pool_size: number;
    database_connection_minimum_pool_size: number;
    database_name: string;
    database_collection_name: string;
    mongodb_database_client: MongoClient | undefined;

    /**
     * Builds a mongodb object which can perform various operations on a mongodb database
     * @param username username of a database administrator
     * @param password password of a database administrator
     * @param connection_string connection string to the database
     * @param maximumPoolSize maximum pool size for database connections
     * @param minimumPoolSize minimum pool size for database connections
     * @param database_name name of a database in the mongodb cluster
     * @param database_collection_name name of a collection within the database
     */
    constructor(username: string,
                password: string,
                connection_string: string,
                maximumPoolSize: number,
                minimumPoolSize: number,
                database_name: string,
                database_collection_name: string) {

        this.database_username = username;
        this.database_password = password;
        this.database_connection_string = connection_string;
        this.database_connection_maximum_pool_size = maximumPoolSize;
        this.database_connection_minimum_pool_size = minimumPoolSize;
        this.database_name = database_name;
        this.database_collection_name = database_collection_name;
        this.database_connection_string.replace("${USERNAME}", this.database_username);
        this.database_connection_string.replace("${PASSWORD}", this.database_password);
    }

    /**
     * Uses various settings set in the constructor to create a valid mongodb database client. This client
     * contains a connection pool by default
     */
    async initializeMongodbDatabaseInstance(): Promise<void> {
        if (this.database_connection_string != null) {
            try {
                this.mongodb_database_client = new MongoClient(this.database_connection_string, {
                    maxPoolSize: this.database_connection_maximum_pool_size,
                    minPoolSize: this.database_connection_minimum_pool_size,
                    serverApi: {
                        version: ServerApiVersion.v1,
                        strict: true,
                        deprecationErrors: true,
                    }
                });
                await this.mongodb_database_client.connect();
            } catch (error) {
                throw error;
            }
        } else {
            throw new Error(`The database connection string was undefined`);
        }
    }

    /**
     * Closes the mongodb database client, terminating any existing database pools
     */
    async closeMongodbDatabaseInstanceConnectionPool(): Promise<void> {
        if (this.mongodb_database_client) {
            try {
                await this.mongodb_database_client.close();
            } catch (error) {
                throw error;
            }
        } else {
            throw new Error(`The mongodb client is not initialized`);
        }
    }

    /**
     * A document in mongodb represents a standalone collection of data that does not natively support having connective things like foreign keys.
     * @param collection_name the name of the collection to query
     * @return a Collection of Document objects
     */
    getCollection(collection_name: string): Collection<Document> {
        if (!this.mongodb_database_client) {
            throw new Error(`The mongodb client is not initialized`);
        }

        if (!this.database_name) {
            throw new Error(`The database name is not defined`);
        }

        return this.mongodb_database_client.db(this.database_name).collection(collection_name);
    }
}
