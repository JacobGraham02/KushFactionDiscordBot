import {Collection, Db, MongoClient, ServerApiVersion} from "mongodb";

/**
 * Manages the database connection pool that allows us to perform operations on a mongodb database
 */
export default class DatabaseConnectionManager {
    database_username: string;
    database_password: string;
    database_connection_string: string;
    database_connection_maximum_pool_size: number;
    database_connection_minimum_pool_size: number;
    database_name: string;
    database_collection_name: string;
    database_instance: Db | null;
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
     * @param database_instance an instance of the database that exists in mongodb
     */
    constructor(username: string,
                password: string,
                connection_string: string,
                maximumPoolSize: number,
                minimumPoolSize: number,
                database_name: string,
                database_instance: Db | null,
                database_collection_name: string) {

        this.database_username = username;
        this.database_password = password;
        this.database_connection_string = connection_string;
        this.database_connection_maximum_pool_size = maximumPoolSize;
        this.database_connection_minimum_pool_size = minimumPoolSize;
        this.database_name = database_name;
        this.database_collection_name = database_collection_name;
        this.database_instance = null;
        this.database_connection_string = this.database_connection_string
            .replace("${USERNAME}", encodeURIComponent(this.database_username))
            .replace("${PASSWORD}", encodeURIComponent(this.database_password));

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
                this.database_instance = this.mongodb_database_client.db(this.database_name);
            } catch (error) {
                throw error;
            }
        } else {
            throw new Error(`The database connection string was undefined`);
        }
    }

    /**
     * Closes the mongodb database client, terminating any existing database pools and setting the existing database instance to null
     */
    async closeMongodbDatabaseInstanceConnectionPool(): Promise<void> {
        if (this.mongodb_database_client) {
            try {
                await this.mongodb_database_client.close();
                this.database_instance = null;
            } catch (error) {
                throw error;
            }
        } else {
            throw new Error(`The mongodb client is not initialized`);
        }
    }

    /**
     * Collections are received synchronously from an established connection to mongodb, so they function does not have to be async.
     * the .collection() function from mongodb returns Collection<any>, so that is also the return type of this function
     * The expected return value of this function is Collection<Document>
     * @return a Collection of Document objects
     */
    getCollection(collection_name: string): Collection<any>  {
        if (!this.mongodb_database_client) {
            throw new Error(`The MongoDB client is not initialized`);
        }

        if (!this.database_name) {
            throw new Error(`The database name is not defined`);
        }

        return this.mongodb_database_client.db(this.database_name).collection<any>(collection_name);
    }
}
