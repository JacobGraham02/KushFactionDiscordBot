import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    AnyComponentBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, MessageFlags, StringSelectMenuInteraction,
} from "discord.js";
import * as fs from "node:fs";
import {ICommand} from "../interfaces/ICommand";

/**
 * Creates a drop down list of links that, with each link directing to a PZ fans online map
 */
export default class CreatePzfansMapLinks implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('pzfans-map-links')
        .setDescription(`Get a list of all PZfans map links for APA`);

    authorization_role_name: string[] = [];

    /**
     * Replies to the user interaction /PZfans by sending a dropdown list of PZ fans map links
     * @param interaction how the user interacted with the bot through Discord
     */
    async execute(interaction: any): Promise<void> {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const json_file_path: string = `src/commands/data/PzfansMaps.json`;
        let actionRow: ActionRowBuilder<AnyComponentBuilder>;

        try {
            actionRow = await createPzfansDropdownMenu(json_file_path);
            await interaction.editReply({
                content: `Please select a map:`,
                components: [actionRow],
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            if (interaction.replied || interaction.deferred) {
                try {
                    await interaction.followUp({
                        content: `There was an error when attempting to show the drop down list: ${error}`,
                        flags: MessageFlags.Ephemeral
                    });
                } catch (followUpError) {
                    console.error(`Failed to send drop down menu follow up message: ${followUpError}`)
                }
            }
            await interaction.editReply({
                content: `There was an error when attempting to load the map selector menu: ${error}`,
                flags: MessageFlags.Ephemeral
            });
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
        const json_data: string = await fs.promises.readFile(`${json_file_path}`, "utf-8");
        const map_data_object = JSON.parse(json_data);
        const option_menu_data = Object.values(map_data_object);

        const menu_options: StringSelectMenuOptionBuilder[] = option_menu_data.map(((map_item: any, index: number): StringSelectMenuOptionBuilder => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(map_item.label)
                .setDescription(map_item.description)
                .setValue(index.toString());
        }));

        const select_pzfans_map: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId("PZfans_map_selector_menu")
            .setPlaceholder("Select a map")
            .addOptions(
                menu_options
            )

        const actionRow: ActionRowBuilder<AnyComponentBuilder> = new ActionRowBuilder().addComponents(select_pzfans_map);

        return actionRow;
    } catch (error) {
        throw new Error(`Failed to load PZ fans map data: ${error}`);
    }
}

