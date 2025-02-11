import {
    ActionRowBuilder,
    ButtonInteraction,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import InteractionHandler from "../InteractionHandler";
import {BotDataRepository} from "../../database/mongodb/repository/BotDataRepository";
import {IFactionGoals} from "../../models/IFactionGoals";

/**
 * Uses abstract class InteractionHandler to provide implementation specifically for
 * ModalSubmitInteraction interaction types
 * @param button_interaction ButtonInteraction
 */
export default class ButtonHandler extends InteractionHandler {

    constructor(private button_interaction: ButtonInteraction) {
        super(button_interaction);
    }

    /**
     * A switch/case is used here along with the unique button id to determine what action should be done
     */
    public async handle(database_repository: BotDataRepository, faction_id: string): Promise<void> {
        const button_id: string = this.button_interaction.customId;

        switch (true) {
            case button_id.startsWith("update_goal_"): {
                const goal_name: string = button_id.replace("update_goal_", "");

                const goal_data: IFactionGoals | null = await database_repository.getFactionGoal(goal_name);
                if (!goal_data) {
                    await this.button_interaction.reply({
                        content: `The goal **${goal_name}** does not exist.`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                const update_modal: ModalBuilder = new ModalBuilder()
                    .setCustomId(`update_goal_modal_${goal_name}`)
                    .setTitle(`Update Goal: ${goal_name}`);

                const description_input: TextInputBuilder = new TextInputBuilder()
                    .setCustomId("goal_description")
                    .setLabel("Description")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder("Enter new goal description")
                    .setValue(goal_data.description ?? "")
                    .setRequired(false);

                const status_input: TextInputBuilder = new TextInputBuilder()
                    .setCustomId("goal_status")
                    .setLabel("Status")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Enter new status (pending, in progress, completed, TBA)")
                    .setValue(goal_data.status ?? "TBA")
                    .setRequired(true);

                update_modal.addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(description_input),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(status_input)
                );

                await this.button_interaction.showModal(update_modal);
                break;
            }

            case button_id.startsWith("delete_goal_"): {
                const goal_name = button_id.replace("delete_goal_", "");

                const delete_confirmation_modal: ModalBuilder = new ModalBuilder()
                    .setCustomId(`confirm_delete_goal_${goal_name}`)
                    .setTitle(`Confirm Goal Deletion?`)

                const confirmation_input: TextInputBuilder = new TextInputBuilder()
                    .setCustomId(`delete_confirmation`)
                    .setLabel(`Type "${goal_name}" to confirm`)
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder(`(Optional) ${goal_name}`)
                    .setRequired(false)

                delete_confirmation_modal.addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        confirmation_input
                    )
                );

                await this.button_interaction.showModal(delete_confirmation_modal);
                break;
            }
            case button_id === "farming_button": {
                const current_unix_timestamp: number = Math.floor(Date.now() / 1000);
                const timestamp_for_discord: string = `<t:${current_unix_timestamp}:F>`;
                await this.button_interaction.reply({
                    content: `The crops were last watered on ${timestamp_for_discord}`,
                    flags: MessageFlags.Ephemeral
                });
                break;
            }
            default: {
                throw new Error(`No operation for the button id ${button_id} was found`)
            }
        }
    }
}
