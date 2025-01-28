import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    AnyComponentBuilder,
} from "discord.js";

export default function() {
    const farming_info_object: Object = {
        data: new SlashCommandBuilder()
            .setName(`create-bot-farming-button`)
            .setDescription(`Adds 1 button for informing when the farm has been watered last`)
            .addChannelOption(option =>
                option.setName(`add_extra_info`)
                    .setDescription(`(Optional) Add additional farming info?`)
                    .setRequired(false)
            ),
        authorization_role_name: [""],

        /**
         * Replies to the user interaction /create-bot-role-button by sending a button that will grant administrative permissions to the bot
         * @param interaction
         */
        async execute(interaction: any): Promise<void> {
            const watered_crops_button: ButtonBuilder = new ButtonBuilder()
                .setCustomId('farming_button')
                .setLabel('Watered crops')
                .setStyle(ButtonStyle.Success);

            const farming_button_row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder()
                .addComponents(
                    watered_crops_button
                )

            await interaction.reply({
                content: `Shown below is a button which will inform everyone the last time crops were watered`,
                components: [farming_button_row]
            });
        }
    }
}
