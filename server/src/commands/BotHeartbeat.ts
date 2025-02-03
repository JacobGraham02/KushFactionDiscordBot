import {ICommand} from "../interfaces/ICommand";
import {MessageFlags, SlashCommandBuilder} from "discord.js";

/**
 * Creates a button which allow users to update the last time at which crops were watered
 */
export default class CheckBotHeartbeat implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName(`check-heartbeat`)
        .setDescription(`Check if the bot is active`)

    authorization_role_name: string[] = [""]

    /**
     * Replies to the user interaction /create-bot-role-button by sending a button that will grant administrative permissions to the bot
     * @param interaction
     */
    async execute(interaction: any): Promise<void> {
        await interaction.reply({
            content: `The bot is active`,
            flags: MessageFlags.Ephemeral
        });
    }
}
