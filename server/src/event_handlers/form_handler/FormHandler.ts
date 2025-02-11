import InteractionHandler from "../InteractionHandler";
import {ModalSubmitInteraction, MessageFlags } from "discord.js";
import {BotDataRepository} from "../../database/mongodb/repository/BotDataRepository";
import {IFactionGoals} from "../../models/IFactionGoals";
import {UpdateResult} from "mongodb";

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

                const database_result: UpdateResult<any> = await database_repository.createOrUpdateFactionGoals(faction_id, data);

                await this.form_interaction.reply({
                    content: `✅ Goal **${goal_name}** updated successfully.`,
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

                const deletion_result: boolean = await database_repository.deleteFactionGoal(goal_name);

                if (!deletion_result) {
                    await this.form_interaction.reply({
                       content: `Could not delete **${goal_name}**. Please try again or contact the bot administrator`,
                       flags: MessageFlags.Ephemeral
                    });
                    break;
                }

                await this.form_interaction.reply({
                    content: `Goal **${goal_name}** was deleted successfully`,
                    flags: MessageFlags.Ephemeral
                });
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
