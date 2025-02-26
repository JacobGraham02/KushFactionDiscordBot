import InteractionHandler from "../InteractionHandler";
import {ModalSubmitInteraction, MessageFlags } from "discord.js";
import {BotDataRepository} from "../../database/mongodb/repository/BotDataRepository";
import {IFactionGoals} from "../../models/IFactionGoals";
import {UpdateResult} from "mongodb";
import IBotDataDocument from "../../models/IBotDataDocument";

/**
 * Uses abstract class InteractionHandler to provide implementation specifically for
 * ModalSubmitInteraction interaction types
 * @param form_interaction ModalSubmitInteraction
 */
export default class FormHandler extends InteractionHandler {

    constructor(private form_interaction: ModalSubmitInteraction) {
        super(form_interaction);
    }

    /**
     * A switch/case is used here along with the unique form id to determine what action should be done
     */
    public async handle(database_repository: BotDataRepository, faction_id: string): Promise<void> {
        const form_id: string = this.form_interaction.customId;

        switch (true) {
            case form_id.startsWith("create_faction_goal_"): {
                const goal_name: string = this.form_interaction.fields.getTextInputValue("faction_goal_name");
                const goal_description: string = this.form_interaction.fields.getTextInputValue("faction_goal_description");
                const goal_status: string = this.form_interaction.fields.getTextInputValue("faction_goal_status");

                const faction_goal_data: IFactionGoals = {
                    faction_id: faction_id,
                    goal_name: goal_name,
                    description: goal_description,
                    status: goal_status
                }

                try {
                    const database_result: UpdateResult<any> = await database_repository.createOrUpdateFactionGoals(faction_id, faction_goal_data);
                    if (!database_result) {
                        await this.form_interaction.reply({
                            content: `Could not create **${goal_name}. Please try again or contact the bot developer`,
                            flags: MessageFlags.Ephemeral
                        });
                    }
                } catch (error) {
                    throw error;
                }

                await this.form_interaction.reply({
                    content: `Goal **${goal_name}** created successfully.`,
                    flags: MessageFlags.Ephemeral
                });

                break;
            }
            case form_id.startsWith("update_goal_modal_"): {
                const goal_name: string = form_id.replace("update_goal_modal_", "");
                const description: string = this.form_interaction.fields.getTextInputValue("goal_description");
                const status: string = this.form_interaction.fields.getTextInputValue("goal_status");
                const data: IFactionGoals = {
                    faction_id: faction_id,
                    goal_name: goal_name,
                    description: description,
                    status: status
                }

                try {
                    const database_result: UpdateResult<any> = await database_repository.createOrUpdateFactionGoals(faction_id, data);
                    if (!database_result) {
                        await this.form_interaction.reply({
                            content: `Could not update **${goal_name}**. Please try again or contact the bot administrator`,
                            flags: MessageFlags.Ephemeral
                        });
                    }
                } catch (error) {
                    throw error;
                }

                await this.form_interaction.reply({
                    content: `Goal **${goal_name}** updated successfully.`,
                    flags: MessageFlags.Ephemeral
                });
                break;
            }

            case form_id.startsWith("confirm_delete_goal_"): {
                const goal_name: string = form_id.replace("confirm_delete_goal_", "");
                const user_input: string = this.form_interaction.fields.getTextInputValue("delete_confirmation");

                if (user_input !== goal_name) {
                    await this.form_interaction.reply({
                        content: `Goal name mismatch. Deletion cancelled`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                try {
                    const deletion_result: boolean = await database_repository.deleteFactionGoal(goal_name);
                    if (!deletion_result) {
                        await this.form_interaction.reply({
                            content: `Could not delete **${goal_name}**. Please try again or contact the bot administrator`,
                            flags: MessageFlags.Ephemeral
                        });
                    }
                } catch (error) {
                    throw error;
                }

                await this.form_interaction.reply({
                    content: `Goal **${goal_name}** was deleted successfully`,
                    flags: MessageFlags.Ephemeral
                });
                break;
            }
            case form_id.startsWith("update_bot_data_modal_"): {
                const faction_id: string = form_id.replace("update_bot_data_modal_", "");
                const faction_goals_channel_id: string = this.form_interaction.fields.getTextInputValue("faction_goals_channel_id");
                const faction_resource_storage_channel_id: string = this.form_interaction.fields.getTextInputValue("faction_resource_storage_channel_id");
                const faction_pzfans_maps_channel_id: string = this.form_interaction.fields.getTextInputValue("faction_pzfans_maps_channel_id");
                const faction_farming_channel_id: string = this.form_interaction.fields.getTextInputValue("faction_farming_channel_id");
                const faction_areas_looted_channel_id: string = this.form_interaction.fields.getTextInputValue("faction_areas_looted_channel_id");

                const data: IBotDataDocument = {
                    discord_guild_id: faction_id,
                    discord_faction_goals_channel_id: faction_goals_channel_id,
                    discord_resource_storage_channel_id: faction_resource_storage_channel_id,
                    discord_pzfans_maps_channel_id: faction_pzfans_maps_channel_id,
                    discord_farming_channel_id: faction_farming_channel_id,
                    discord_areas_looted_channel_id: faction_areas_looted_channel_id
                }

                try {
                    const database_result: UpdateResult<any> | null = await database_repository.update(data);
                    if (!database_result) {
                        await this.form_interaction.reply({
                            content: `Could not update bot data for guild **${faction_id}**. Please try again or contact the bot administrator`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }
                    await this.form_interaction.reply({
                        content: `Bot data for guild **${faction_id}** updated successfully`,
                        flags: MessageFlags.Ephemeral
                    });
                } catch (error) {
                    throw error;
                }

                break;
            }

            case form_id === 'farming_form': {
                await this.form_interaction.reply({
                    content: `You have successfully submitted the farming data form`,
                    flags: MessageFlags.Ephemeral
                });
                break;
            }
            default: {
                throw new Error(`No operation for the form id ${form_id} was found`);
            }
        }
    }
}
