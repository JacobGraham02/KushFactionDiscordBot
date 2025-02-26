import InteractionHandler from "../InteractionHandler";
import {ModalSubmitInteraction, MessageFlags, StringSelectMenuInteraction} from "discord.js";
import {BotDataRepository} from "../../database/mongodb/repository/BotDataRepository";
import {IFactionGoals} from "../../models/IFactionGoals";
import {UpdateResult} from "mongodb";
import IBotDataDocument from "../../models/IBotDataDocument";
import fs from "node:fs";

/**
 * Uses abstract class InteractionHandler to provide implementation specifically for
 * StringSelectMenuInteraction interaction types
 * @param form_interaction StringSelectMenuInteraction
 */
export default class SelectMenuHandler extends InteractionHandler {

    constructor(private select_menu_interaction: StringSelectMenuInteraction) {
        super(select_menu_interaction);
    }

    /**
     * A switch/case is used here along with the unique string select menu id to determine what action should be done
     */
    public async handle(): Promise<void> {
        const select_menu_id: string = this.select_menu_interaction.customId;

        switch (true) {
            case select_menu_id === "PZfans_map_selector_menu": {
                const json_file_path: string = `src/commands/data/PzfansMaps.json`;
                const json_data: string = await fs.promises.readFile(`${json_file_path}`, "utf-8");

                const map_data: any = JSON.parse(json_data);
                const map_data_array: PzFanMapData[] = Object.values(map_data) as PzFanMapData[];

                // Retrieves the index which was selected from the select menu
                const selected_value: string = this.select_menu_interaction.values[0];

                const selected_index: number = parseInt(selected_value, 10);
                const selected_map: PzFanMapData = map_data_array[selected_index];

                await this.select_menu_interaction.reply({
                    content: `**${selected_map.label}**\n[${selected_map.label}](${selected_map.url})\n\n${selected_map.description}\n`,
                    flags: MessageFlags.Ephemeral,
                });
                break;
            }
            default: {
                throw new Error(`No operation for the select menu id ${select_menu_id} was found`);
            }
        }
    }
}
