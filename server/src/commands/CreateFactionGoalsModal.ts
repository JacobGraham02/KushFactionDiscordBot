import {ICommand} from "../interfaces/ICommand";
import {ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class CreateFactionGoalsModal implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('create_faction_goal')
        .setDescription(`Create a faction goal`)
    authorization_role_name: string[] = [""]

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
            .setLabel("(Optional) Mpc value (0 - 10 digits)")
            .setRequired(false)
            .setMaxLength(10)
            .setPlaceholder(`(Example) 100`)
            .setStyle(TextInputStyle.Paragraph)

        const silver_bullion_value: TextInputBuilder = new TextInputBuilder()
            .setCustomId("faction_goal_silver_bullion")
            .setLabel("(Optional) Silver bullion amount (0 - 5 digits)")
    }
}
