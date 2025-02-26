import {ICommand} from "../interfaces/ICommand";
import {
    ActionRowBuilder,
    AnyComponentBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    SlashCommandBuilder, SlashCommandOptionsOnlyBuilder
} from "discord.js";

/**
 * Administrator command which allows users to change the name of the bot
 */
export default class CreateBotFarmingButton implements ICommand {
    data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
        .setName('change-bot-username')
        .setDescription(`Use this command to change the username of the bot`)
        .addStringOption(option =>
            option.setName(`bot-username`)
                .setDescription(`(Required) Enter a new username for the bot`)
                .setRequired(true)
        );
    authorization_role_name: string[] = ["Bot administrator"];

    /**
     * Replies to the user interaction /create-bot-role-button by sending a button that will grant administrative permissions to the bot
     * @param interaction
     */
    async execute(interaction: any): Promise<void> {
        const new_bot_username: string = interaction.options.getString("bot-username");

        if (!new_bot_username) {
            await interaction.reply({
                content: `The new username for the bot is invalid. Please ensure the name contains valid characters (a-z A-Z 0-9)`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try {
            await interaction.client.user.setUsername(new_bot_username);
            await interaction.reply({
                content: `The bot username has been changed to ${new_bot_username}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            await interaction.reply({
               content: `There was an error when attempting to change the Discord bot username: ${error}`,
               flags: MessageFlags.Ephemeral
            });
            throw error;
        }
    }
}
