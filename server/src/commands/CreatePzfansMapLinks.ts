import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    AnyComponentBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import * as fs from "node:fs";
import {ICommand} from "../interfaces/ICommand";

/**
 * Creates a drop down list of links that, with each link directing to a PZ fans online map
 */
export default class CreatePzfansMapLinks implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('PZfans')
        .setDescription(`Get a list of all PZfans map links for APA`);

    authorization_role_name: string[] = [""];

    /**
     * Replies to the user interaction /PZfans by sending a dropdown list of PZ fans map links
     * @param interaction how the user interacted with the bot through Discord
     */
    async execute(interaction: any): Promise<void> {
        try {
            const json_file_path: string = `./data/PzfansMaps.json`;
            const actionRow: ActionRowBuilder<AnyComponentBuilder> = await createPzfansDropdownMenu(json_file_path);

            await interaction.reply({
                content: `Please select a map:`,
                components: [actionRow],
                ephemeral: true,
            })
        } catch (error) {
            await interaction.reply({
                content: `There was an error when attempting to load the map selector menu: ${error}`,
                ephemeral: true,
            })
        }
    }
}

/**
 * Constructs a dropdown menu that is then used to show the user a list of available Zomboid maps that they can access on the
 * Project Zomboid Fans website
 * @param json_file_path file path to the map data json file
 */
async function createPzfansDropdownMenu(json_file_path: string): Promise<ActionRowBuilder<AnyComponentBuilder>> {
    try {
        const json_data: string = fs.readFileSync(`${json_file_path}`, "utf-8");
        const option_menu_data: IPzFansMapItem[] = JSON.parse(json_data);

        const menu_options: StringSelectMenuOptionBuilder[] = option_menu_data.map(map_item => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(map_item.label)
                .setDescription(map_item.description)
                .setValue(map_item.url);
        });

        const select_pzfans_map = new StringSelectMenuBuilder()
            .setCustomId("PZfans_map_selector_menu")
            .setPlaceholder("Select a map")
            .addOptions(
                menu_options
            )

        const actionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(select_pzfans_map);

        return actionRow;
    } catch (error) {
        throw error;
    }
}

