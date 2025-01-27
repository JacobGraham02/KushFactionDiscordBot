import {SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AnyComponentBuilder} from "discord.js";

export default function() {
    const create_bot_role_button_object: Object = {
        data: new SlashCommandBuilder()
            .setName(`create-bot-role-button`)
            .setDescription(`Adds 1 button which grants administrative permissions to the bot`)
            .addChannelOption(option =>
                option.setName(`add_bot_admin_button`)
                    .setDescription(`(Optional) Add administrative button?`)
                    .setRequired(false)
            ),
        authorization_role_name: [""],

        async execute(interaction: any): Promise<void> {
            let channel_to_add_button = interaction.options.channel_name;

            if (!channel_to_add_button) {
                channel_to_add_button = interaction.channel;
            }


        }
    }
}
