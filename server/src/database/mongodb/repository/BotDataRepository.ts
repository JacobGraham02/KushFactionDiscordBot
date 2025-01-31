import {DatabaseRepository} from "../../repository/DatabaseRepository";
import {Collection, Db, DeleteResult, UpdateResult} from "mongodb";
import IBotDataDocument from "../../../models/IBotDataDocument";

/**
 * Created a base CRUD class that is used to interact with a specific mongodb collection
 */
export class BotDataRepository extends DatabaseRepository<any> {
    private collection: Collection<any>

    /**
     * Initializes the bot data repository class with an active mongodb database connection and
     * the name of a collection to perform operations on
     * @param database_instance instance of mongodb database connection
     * @param collection_name name of mongodb database collection
     */
    constructor(private database_instance: Db, private collection_name: string) {
        super();
        this.collection = database_instance.collection(collection_name);
    }

    /**
     * Returns a Document that conforms to the structure defined in the interface IBotDataDocument, or null if no document is found
     * @param id the Discord guild id
     * @returns IBotDataDocument or null depending on if bot data is present
     */
    async findById(id: string): Promise<IBotDataDocument | null> {
        try {
            const bot_data_collection: IBotDataDocument | null = await this.collection.findOne({ discord_guild_id: id});
            return bot_data_collection;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates a new bot data document or updates an existing one
     * @param data The bot data to insert or update
     * @returns Promise<UpdateResult<any>> The update result object
     */
    async create(data: IBotDataDocument): Promise<UpdateResult<any>> {
        try {
            const create_data_result: UpdateResult<any> = await this.collection.updateOne(
                {discord_guild_id: data.discord_guild_id},
                {$set: data},
                {upsert: true}
            );
            return create_data_result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates an existing bot data document
     * @param data The bot data to update
     * @returns The modified bot data document if found, otherwise null
     */
    async update(data: IBotDataDocument): Promise<UpdateResult<any> | null> {
        try {
            const update_data_result: UpdateResult<any> = await this.collection.updateOne(
                {discord_guild_id: data.discord_guild_id},
                {$set: data},
                {upsert: true}
            );
            return update_data_result;
        } catch (error) {
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletion_result: DeleteResult = await this.collection.deleteOne({ discord_guild_id: id });
            return deletion_result.deletedCount >= 1;
        } catch (error) {
            throw error;
        }
    }
}
