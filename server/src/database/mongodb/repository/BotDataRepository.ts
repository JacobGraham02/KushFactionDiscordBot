import {DatabaseRepository} from "../../repository/DatabaseRepository";
import {Collection, Db, DeleteResult, UpdateResult} from "mongodb";
import IBotDataDocument from "../../../models/IBotDataDocument";
import {IFactionGoals} from "../../../models/IFactionGoals";
import IFactionResources from "../../../models/IFactionResources";
import IFactionTraitBuild from "../../../models/IFactionTraitBuild";
import {ECollections} from "../../../enums/ECollections";

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
    constructor(private database_instance: Db, private collection_name: ECollections) {
        super();
        this.collection = this.getCollection(collection_name);
    }

    /**
     * Factory method to dynamically switch collections based on the name provided
     * @param collection_name The name of the target collection
     */
    getCollection(collection_name: string): Collection<any> {
        return this.database_instance.collection(collection_name);
    }

    /**
     * Returns a Document that conforms to the structure defined in the interface IBotDataDocument, or null if no document is found
     * @param id the Discord guild id
     * @returns IBotDataDocument or null depending on if bot data is present
     */
    async findById(id: string): Promise<IBotDataDocument | null> {
        const collection: Collection<any> = this.getCollection(ECollections.BOT_DATA);
        try {
            const bot_data_collection: IBotDataDocument | null = await collection.findOne({ discord_guild_id: id});

            if (!bot_data_collection) {
                throw new Error(`The bot data document is null`);
            }

            return {
                discord_guild_id: bot_data_collection.discord_guild_id,
                discord_faction_goals_channel_id: bot_data_collection.discord_faction_goals_channel_id,
                discord_resource_storage_channel_id: bot_data_collection.discord_resource_storage_channel_id,
                discord_pzfans_maps_channel_id: bot_data_collection.discord_pzfans_maps_channel_id,
                discord_farming_channel_id: bot_data_collection.discord_areas_looted_channel_id,
                discord_areas_looted_channel_id: bot_data_collection.discord_areas_looted_channel_id,
            } as IBotDataDocument;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates a new bot channel id data document or updates an existing one
     * @param data The bot data to insert or update
     * @returns Promise<UpdateResult<any>> The update result object
     */
    async create(data: IBotDataDocument): Promise<UpdateResult<any>> {
        const collection: Collection<any> = this.getCollection(ECollections.BOT_DATA);
        try {
            const create_data_result: UpdateResult<any> = await collection.updateOne(
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
        const collection: Collection<any> = this.getCollection(ECollections.BOT_DATA);
        try {
            const update_data_result: UpdateResult<any> = await collection.updateOne(
                {discord_guild_id: data.discord_guild_id},
                {$set: data},
                {upsert: true}
            );
            return update_data_result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes an existing bot data document
     * @param id The id of the Discord bot
     * @returns If the bot data was deleted successfully
     */
    async delete(id: string): Promise<boolean> {
        const collection: Collection<any> = this.getCollection(ECollections.BOT_DATA);
        try {
            const deletion_result: DeleteResult = await collection.deleteOne({ discord_guild_id: id });
            return deletion_result.deletedCount >= 1;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates or updates faction goals
     * @param id The id of the faction goal Document
     * @param data The data that conforms to IFactionGoals to be entered into the database
     * @return The update result from the update operation
     */
    async createOrUpdateFactionGoals(id: string, data: IFactionGoals): Promise<UpdateResult<any>> {
        const collection: Collection<any> = this.getCollection(ECollections.FACTION_GOALS);
        try {
            const create_or_update_faction_goals_result: UpdateResult<any> = await collection.updateOne(
                {faction_goals_id: id},
                {$set: data},
                {upsert: true}
            );
            return create_or_update_faction_goals_result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Gets faction goals for a specific faction
     * @param id The id of the faction to get goals for
     * @return IFactionGoals formatted object if data could be found, null otherwise
     */
    async getFactionGoals(id: string): Promise<IFactionGoals[] | null> {
        const collection: Collection<any> = this.getCollection(ECollections.FACTION_GOALS);
        try {
            const faction_goals  = await collection.find({ faction_id: id }).toArray();

            if (faction_goals.length <= 0) {
                return null;
            }

            return faction_goals.map(goal => ({
                faction_id: goal.faction_id,
                goal_name: goal.goal_name,
                description: goal.description || "",
                status: goal.status || "TBA"
            })) as IFactionGoals[];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes a faction goal
     * @param goal_name The name of the faction goal to delete
     * @returns `true` if the goal was successfully deleted, `false` otherwise
     */
    async deleteFactionGoal(goal_name: string): Promise<boolean> {
        const collection: Collection<any> = this.getCollection(ECollections.FACTION_GOALS);
        try {
            const delete_result: DeleteResult = await collection.deleteOne({ goal_name });

            if (delete_result.deletedCount === 0) {
                return false;
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Gets a faction goal for a specific faction
     * @param name The id of the faction to get a goal for
     * @return IFactionGoals formatted object if data could be found, null otherwise
     */
    async getFactionGoal(name: string): Promise<IFactionGoals | null> {
        const collection: Collection<any> = this.getCollection(ECollections.FACTION_GOALS);
        try {
            const faction_goal  = await collection.findOne({ goal_name: name });

            if (!faction_goal) {
                return null;
            }

            return {
                faction_id: faction_goal.faction_id,
                goal_name: faction_goal.goal_name,
                description: faction_goal.description || "",
                status: faction_goal.status || "TBA"
            } as IFactionGoals;
        } catch (error) {
            throw error;
        }
    }

    /**
     *
     * Creates or updates faction resource count
     * @param id The id of the faction resource count Document
     * @param data The data that conforms to IFactionResources to be entered into the database
     * @return The update result from the update operation
     */
    async createOrUpdateFactionResources(id: string, data: IFactionResources): Promise<UpdateResult<any>> {
        const collection: Collection<any> = this.getCollection(ECollections.FACTION_RESOURCES);
        try {
            const create_or_update_faction_resources_result: UpdateResult<any> = await collection.updateOne(
                {faction_resources_id: id},
                {$set: { resources: data.resources }},
                {upsert: true}
            );
            return create_or_update_faction_resources_result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Gets faction resources for a specific faction
     * @param id The id of the faction to get resources for
     */
    async getFactionResources(id: string): Promise<IFactionResources[] | null> {
        const collection: Collection<any> = this.getCollection(ECollections.FACTION_RESOURCES);
        try {
            const faction_resources = await collection.find({ faction_id: id }).toArray()

            if (!faction_resources) {
                return null;
            }

            return faction_resources.map(resource => ({
                faction_id: resource.faction_id,
                resources: resource.resources || {}
            })) as IFactionResources[];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates or updates a faction user player build
     * @param id The id of the Discord user that the build is for
     * @param data The structure of the data to submit to mongodb
     * @return The update result from the upsert operation
     */
    async createOrUpdateFactionBuild(id: string, data: IFactionTraitBuild): Promise<UpdateResult<any>> {
        const collection: Collection<any> = this.getCollection(ECollections.FACTION_BUILDS);
        try {
            if (this.collection_name !== ECollections.FACTION_BUILDS) {
                this.collection = this.getCollection(ECollections.FACTION_BUILDS);
            }
            const create_or_update_faction_build_result: UpdateResult<any> = await collection.updateOne(
                {discord_user_id: id},
                {$set: data},
                {upsert: true}
            );
            return create_or_update_faction_build_result;
        } catch (error) {
            throw error;
        }
    }
}
