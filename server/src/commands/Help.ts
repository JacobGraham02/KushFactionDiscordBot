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
 * Command which allows users to view all available commands with the bot
 */
export default class CreateBotFarmingButton implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('help')
        .setDescription(`Lists all available bot commands`);

    authorization_role_name: string[] = [];

    /**
     * Command which sends all available bot commands to the channel the user requests them in when they use the '/help' command
     * @param interaction
     */
    async execute(interaction: any): Promise<void> {
        const command_list: string[] = [
            `**Regular commands:**`,
            `**1.** /help - Displays a list of helpful commands that can be used with the bot`,
            `**2.** /show-faction-goals - Displays a list of faction goals`,
            `**3.** /create-faction-goal - Displays an easy-to-use form where to create a faction goal`,
            `**4.** /change-bot-username - Allows you to change the bot username`,
            `**5.** /check-heartbeat - Allows you to check if the bot is alive`,
            `**6.** /github - Allows you to go to the GitHub repository that contains the bot code`,
            `\n`,
            `**Administrator commands:**`,
            `**1.** /show-bot-data - Shows the number id of each channel that is registered with the bot`,
            `**2.** /create-bot-farming-button - Creates a button that will update the timestamp that the crops were harvested`,
            `**3.** /create-bot-role-button - Creates a button that will grant a user the 'Bot Administrator' role`,
            `**4.** /create-lootable-areas - Creates a list of lootable areas with an associated map link and timestamp for when last looted`,
            `**5.** /pzfans-map-links - Creates a list of pzfans map links`
        ];

        try {
            await interaction.reply({
                content: `**Available Commands:**\n${command_list.join('\n')}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            throw error;
        }
    }
}
