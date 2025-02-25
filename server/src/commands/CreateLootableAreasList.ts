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
            const json_file_path: string = `./data/PzfansMaps.json`;
            const area_data: IPzFansMapItem[] = JSON.parse(fs.readFileSync(json_file_path, "utf-8"));

            let lootable_areas_text: string = ``;
            for (const area of area_data) {
                lootable_areas_text += `**${area.label}**\n`;
                lootable_areas_text += `${area.description}\n`;
                lootable_areas_text += `Last looted: N/A\n`;
                lootable_areas_text += `[${area.label} map url (pzfans.com):] ${area.url}\n\n`;

                const mark_looted_button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId(`mark_looted_${area.id}`)
                    .setLabel("Mark as looted")
                    .setStyle(ButtonStyle.Primary)

                const action_row: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder()
                    .addComponents(mark_looted_button)

                await interaction.channel.send({
                    content: lootable_areas_text,
                    components: [action_row]
                });
            }
        } catch (error) {
            throw error;
        }
    }
}
