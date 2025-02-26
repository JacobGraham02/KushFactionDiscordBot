import {
    ActionRowBuilder,
    AnyComponentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder, MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import {ICommand} from "../interfaces/ICommand";
import fs from "fs";

/**
 * Creates a list of embedded messages that will give you information on when areas were looted last. This helps keep the list of
 * looted areas organized
 */
export default class CreateLootableAreasList implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('create-lootable-areas')
        .setDescription('Displays a list of lootable towns')

    authorization_role_name: string[] = [];

    async execute(interaction: any): Promise<void> {
        try {
            const json_file_path: string = `src/commands/data/PzfansMaps.json`;
            const json_data: string = await fs.promises.readFile(json_file_path, "utf-8");
            const lootable_areas_object = JSON.parse(json_data);
            const lootable_areas_data = Object.values(lootable_areas_object) as PzFanMapData[];

            let lootable_areas_text: string = ``;
            const buttons: ButtonBuilder[] = [];
            const button_row: ActionRowBuilder<AnyComponentBuilder>[] = [];

            // Loop through each map data object and send an individual message
            for (const area of lootable_areas_data) {
                let area_text: string = "";
                area_text += `**${area.label}**\n`;
                area_text += `${area.description}\n`;
                area_text += `Last looted: N/A\n`;
                area_text += `[${area.label} map url (pzfans.com):] ${area.url}\n\n`;

                // Create a single button for marking this area as looted
                const mark_looted_button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId(`mark_looted_${area.id}`)
                    .setLabel("Mark as looted")
                    .setStyle(ButtonStyle.Primary);

                // Create an action row containing the button
                const action_row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder()
                    .addComponents(mark_looted_button);

                // Send an individual message for the current map
                await interaction.channel.send({
                    content: area_text,
                    components: [action_row],
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            throw error;
        }
    }
}
