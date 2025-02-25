import {ICommand} from "../interfaces/ICommand";
import {
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
            .setLabel("(Required) Goal name (1 - 100 characters)")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(100)
            .setPlaceholder(`(Example) land claim cost`)
            .setStyle(TextInputStyle.Paragraph)

        const goal_description: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_description")
            .setLabel("(Optional) Description (0 - 500 characters)")
            .setRequired(false)
            .setMaxLength(500)
            .setPlaceholder(`(Example) cost to buy a land claim`)
            .setStyle(TextInputStyle.Paragraph)

        const mpc_value: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_mpc_value")
            .setLabel("(Optional) Mpc value (0 - 3 digits)")
            .setRequired(false)
            .setMaxLength(999)
            .setPlaceholder(`(Example) 100`)
            .setStyle(TextInputStyle.Paragraph)

        const silver_bullion_value: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_silver_bullion")
            .setLabel("(Optional) Silver bullion amount (0 - 3 digits)")
            .setRequired(false)
            .setMaxLength(999)
            .setPlaceholder(`(Example) 250`)

        const gold_bullion_value: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_gold_bullion")
            .setLabel("(Optional) Gold bullion amount (0 - 3 digits)")
            .setRequired(false)
            .setMaxLength(999)
            .setPlaceholder(`(Example) 250`)

        const goal_name_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(goal_name);
        const goal_description_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(goal_description);
        const mpc_value_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(mpc_value);
        const silver_bullion_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(silver_bullion_value);
        const gold_bullion_row: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(gold_bullion_value);

        modal.addComponents(goal_name_row, goal_description_row, mpc_value_row, silver_bullion_row, gold_bullion_row);

        try {
            await interaction.showModal(modal);
        } catch (error) {
            throw error;
        }
    }
}
