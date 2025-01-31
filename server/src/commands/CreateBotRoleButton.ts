import {SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AnyComponentBuilder} from "discord.js";
import {ICommand} from "../interfaces/ICommand";

/**
 * Creates a button which will allow users to grant themselves administrative access to the bot (able to change configuration settings)
 */
export default class CreateBotRoleButton implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName(`create-bot-role-button`)
        .setDescription(`Adds 1 button which grants administrative permissions to the bot`);

    authorization_role_name: string[] = [""];

    /**
     * Replies to the user interaction /create-bot-role-button by creating a button that will grant administrative permissions to the bot
     * @param interaction
     */
    async execute(interaction: any): Promise<void> {
        const become_admin_button: ButtonBuilder = new ButtonBuilder()
            .setCustomId('bot_administrator')
            .setLabel(`Confirm administrator`)
            .setStyle(ButtonStyle.Danger);

        const admin_button_row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder()
            .addComponents(become_admin_button)

        await interaction.reply({
            content: `Shown below is a button which will grant you administrative permissions with the bot when clicked. This will give you extra permissions with the bot if clicked, and will assign you a new role`,
            components: [admin_button_row]
        });
    }
}
