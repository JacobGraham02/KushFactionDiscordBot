import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    AnyComponentBuilder,
} from "discord.js";
import {ICommand} from "../interfaces/ICommand";

/**
 * Creates a button which allow users to update the last time at which crops were watered
 */
export default class CreateBotFarmingButton implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName(`create-bot-farming-button`)
        .setDescription(`Adds 1 button for informing when the farm has been watered last`)

    authorization_role_name: string[] = []

    /**
     * Replies to the user interaction /create-bot-role-button by sending a button that will grant administrative permissions to the bot
     * @param interaction
     */
    async execute(interaction: any): Promise<void> {
        const watered_crops_button: ButtonBuilder = new ButtonBuilder()
            .setCustomId('farming_button')
            .setLabel('Watered crops')
            .setStyle(ButtonStyle.Primary);

        const farming_button_row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder()
            .addComponents(
                watered_crops_button
            )

        try {
            await interaction.reply({
                content: `Shown below is a button which will inform everyone the last time crops were watered`,
                components: [farming_button_row]
            });
        } catch (error) {
            throw error;
        }
    }
}
