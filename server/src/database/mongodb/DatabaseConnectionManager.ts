import {Collection, Db, MongoClient, ServerApiVersion} from "mongodb";

/**
 * Manages the database connection pool that allows us to perform operations on a mongodb database
 */
export default class DatabaseConnectionManager {
    database_username: string | undefined;
    database_password: string | undefined;
    database_connection_string: string | undefined;
    database_connection_maximum_pool_size: number | undefined;
    database_connection_minimum_pool_size: number | undefined;
    database_name: string | undefined;
    database_instance: Db | null | undefined;
    mongodb_database_client: MongoClient | undefined;

    /**
     * Builds a mongodb object which can perform various operations on a mongodb database
     * @param database_username username of a database administrator
     * @param database_password password of a database administrator
     * @param database_connection_string connection string to the database
     * @param database_minimum_pool_size minimum pool size for database connections
     * @param database_maximum_pool_size maximum pool size for database connections
     * @param database_name name of a database in the mongodb cluster
     * @param database_instance an instance of the database that exists in mongodb
     */
    constructor(database_username: string | undefined,
                database_password: string | undefined,
                database_connection_string: string | undefined,
                database_minimum_pool_size: number | undefined,
                database_maximum_pool_size: number | undefined,
                database_name: string | undefined,
                database_instance: Db | null) {

        if (database_username) {
            this.database_username = database_username;
        }
        if (database_password) {
            this.database_password = database_password;
        }
        if (database_connection_string) {
            this.database_connection_string = database_connection_string;
        }
        if (database_minimum_pool_size) {
            this.database_connection_minimum_pool_size = database_minimum_pool_size;
        }
        if (database_maximum_pool_size) {
            this.database_connection_maximum_pool_size = database_maximum_pool_size;
        }
        if (database_name) {
            this.database_name = database_name;
        }
        if (database_instance) {
            this.database_instance = database_instance;
        }
        if (this.database_connection_string && this.database_username && this.database_password) {
            this.database_connection_string = this.database_connection_string
                .replace("${USERNAME}", encodeURIComponent(this.database_username))
                .replace("${PASSWORD}", encodeURIComponent(this.database_password));
        }
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
