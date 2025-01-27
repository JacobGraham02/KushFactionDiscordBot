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
}
