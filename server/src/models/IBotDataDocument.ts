import {Collection} from "mongodb";
import {Collections} from "../enums/Collections";
import {IFactionGoals} from "./IFactionGoals";

/**
 * The expected structure of the returned Document from the collection 'bot_data'
 */
export default interface IBotDataDocument {
    discord_guild_id?: string;
    discord_faction_goals_channel_id?: string;
    discord_resource_storage_channel_id?: string;
    discord_pzfans_maps_channel_id?: string;
    discord_farming_channel_id?: string;
    discord_areas_looted_channel_id?: string;
}
