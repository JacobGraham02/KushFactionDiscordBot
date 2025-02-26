import {ICommand} from "../interfaces/ICommand";
import {
    ActionRow,
    ActionRowBuilder,
    AnyComponentBuilder,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

export default class CreateFactionGoalsModal implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('create-faction-goal')
        .setDescription(`Create a faction goal`)
    authorization_role_name: string[] = []

    /**
     * Replies to the user interaction /create_faction_goal by sending a modal for them to fill
     * @param interaction
     */
    async execute(interaction: any): Promise<void> {
        const modal: ModalBuilder = new ModalBuilder()
            .setCustomId("create_faction_goal_modal")
            .setTitle("Create faction goal below:")

        const goal_name: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_name")
            .setLabel("(Required) Goal (1 - 25 characters)")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(25)
            .setPlaceholder(`(Example) land claim cost`)
            .setStyle(TextInputStyle.Short)

        const goal_description: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_description")
            .setLabel("(Optional) Description (0 - 500 characters)")
            .setRequired(false)
            .setMaxLength(500)
            .setPlaceholder(`(Example) cost to buy a land claim`)
            .setStyle(TextInputStyle.Paragraph)

        const goal_status: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_status")
            .setLabel("(Optional) Status (0-25 characters)")
            .setRequired(false)
            .setMaxLength(25)
            .setPlaceholder(`(Example) In progress`)
            .setStyle(TextInputStyle.Short)

        const goal_name_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(goal_name);
        const goal_description_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(goal_description);
        const goal_status_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(goal_status);

        modal.addComponents(goal_name_row, goal_description_row, goal_status_row);

        try {
            await interaction.showModal(modal);
        } catch (error) {
            throw error;
        }
    }
}
