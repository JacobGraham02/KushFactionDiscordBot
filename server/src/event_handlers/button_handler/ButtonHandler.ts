import {
    ActionRowBuilder,
    ButtonInteraction, Message,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import InteractionHandler from "../InteractionHandler";
import {BotDataRepository} from "../../database/mongodb/repository/BotDataRepository";
import {IFactionGoals} from "../../models/IFactionGoals";
import IBotDataDocument from "../../models/IBotDataDocument";

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
            case button_id.startsWith("mark_looted_"): {
                const area_id: string = button_id.replace("mark_looted_", "");
                const message: Message<boolean> = this.button_interaction.message;
                const current_unix_timestamp: number = Math.floor(Date.now() / 1000);
                const timestamp_for_discord = `<t:${current_unix_timestamp}:F>`;

                let updated_content: string = message.content;

                const timestampRegex = /Last Looted: <t: \d+:F>/;

                if (timestampRegex.test(updated_content)) {
                    updated_content = updated_content.replace(timestampRegex, `Last looted: ${timestamp_for_discord}`);
                } else {
                    updated_content = updated_content.replace("Last looted: N/A", `Last looted: ${timestamp_for_discord}`);
                }

                await message.edit({
                    content: updated_content
                });

                await this.button_interaction.reply({
                    content: `Updated loot timestamp`,
                    flags: MessageFlags.Ephemeral
                });

                break;
            }
            case button_id.startsWith("update_goal_"): {
                const goal_name: string = button_id.replace("update_goal_", "");

                const goal_data: IFactionGoals | null = await database_repository.getFactionGoal(goal_name);
                if (!goal_data) {
                    await this.button_interaction.reply({
                        content: `The goal **${goal_name}** does not exist`,
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
            case button_id.startsWith("update_bot_data_"): {
                const bot_data_document: IBotDataDocument | null = await database_repository.findById(faction_id);
                if (!bot_data_document) {
                    await this.button_interaction.reply({
                        content: `No bot data could be found`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                const update_modal: ModalBuilder = new ModalBuilder()
                    .setCustomId(`update_bot_data_modal_${faction_id}`)
                    .setTitle(`Update Bot Data: ${faction_id}`);

                const faction_goals_channel_id: TextInputBuilder = new TextInputBuilder()
                    .setCustomId("faction_goals_channel_id")
                    .setLabel("Goals channel id")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("(Optional) Set new goals channel id")
                    .setValue(bot_data_document.discord_faction_goals_channel_id ?? "")
                    .setRequired(false);

                const faction_resource_storage_channel_id: TextInputBuilder = new TextInputBuilder()
                    .setCustomId("faction_resource_storage_channel_id")
                    .setLabel("Resource storage channel id")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("(Optional) Set new resource storage channel id")
                    .setValue(bot_data_document.discord_resource_storage_channel_id ?? "")
                    .setRequired(false);

                const faction_pzfans_maps_channel_id: TextInputBuilder = new TextInputBuilder()
                    .setCustomId("faction_pzfans_maps_channel_id")
                    .setLabel("Pzfans maps channel id")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("(Optional) Set new pzfans maps channel id")
                    .setValue(bot_data_document.discord_pzfans_maps_channel_id ?? "")
                    .setRequired(false)

                const faction_farming_channel_id: TextInputBuilder = new TextInputBuilder()
                    .setCustomId("faction_farming_channel_id")
                    .setLabel("Farming channel id")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("(Optional) Set new farm channel id")
                    .setValue(bot_data_document.discord_farming_channel_id ?? "")
                    .setRequired(false);

                const faction_areas_looted_channel_id: TextInputBuilder = new TextInputBuilder()
                    .setCustomId("faction_areas_looted_channel_id")
                    .setLabel("Areas looted channel id")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("(Optional) Set new channel id")
                    .setValue(bot_data_document.discord_areas_looted_channel_id ?? "")
                    .setRequired(false)

                update_modal.addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(faction_goals_channel_id),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(faction_resource_storage_channel_id),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(faction_pzfans_maps_channel_id),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(faction_farming_channel_id),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(faction_areas_looted_channel_id)
                );

                await this.button_interaction.showModal(update_modal);
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
