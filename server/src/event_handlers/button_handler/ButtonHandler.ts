import {ButtonInteraction, MessageFlags} from "discord.js";
import InteractionHandler from "../InteractionHandler";

/**
 * Uses abstract class InteractionHandler to provide implementation specifically for
 * ModalSubmitInteraction interaction types
 * @param button_interaction ButtonInteraction
 */
export default class ButtonHandler extends InteractionHandler {

    constructor(private button_interaction: ButtonInteraction) {
        super(button_interaction);
    }

    /**
     * A switch/case is used here along with the unique button id to determine what action should be done
     */
    public async handle(): Promise<void> {
        const button_id: string = this.button_interaction.customId;

        switch (button_id) {
            case 'farming_button': {
                const current_unix_timestamp: number = Math.floor(Date.now() / 1000);
                const timestamp_for_discord: string = `<t:${current_unix_timestamp}:F>`;
                await this.button_interaction.reply({
                    content: `The crops were last watered on ${timestamp_for_discord}`,
                    flags: MessageFlags.Ephemeral
                });
                break;
            }
            default: {
                throw new Error(`No operation for the button id ${button_id} was found`)
            }
        }
    }
}
