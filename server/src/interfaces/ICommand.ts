import {AnyComponentBuilder, SlashCommandBuilder} from "discord.js";

export interface ICommand {
    data: any;
    authorization_role_name: string[];
    execute(interaction: any): Promise<void>;
}
