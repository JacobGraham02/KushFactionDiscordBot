import {SlashCommandBuilder} from "discord.js";

export interface ICommand {
    data: SlashCommandBuilder;
    authorization_role_name: string[];
    execute(interaction: any): Promise<void>;
}
