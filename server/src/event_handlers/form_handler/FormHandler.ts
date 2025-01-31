import InteractionHandler from "../InteractionHandler";
import {ModalSubmitInteraction, MessageFlags } from "discord.js";

/**
 * Uses abstract class InteractionHandler to provide implementation specifically for
 * ModalSubmitInteraction interaction types
 * @param form_interaction ModalSubmitInteraction
 */
export default class FormHandler extends InteractionHandler {

    constructor(private form_interaction: ModalSubmitInteraction) {
        super(form_interaction);
    }

    /**
     * A switch/case is used here along with the unique form id to determine what action should be done
     */
    public async handle(): Promise<void> {
        const form_id = this.form_interaction.customId;

        switch (form_id) {
            case 'farming_form': {
                await this.form_interaction.reply({
                    content: `You have successfully submitted the farming data form`,
                    flags: MessageFlags.Ephemeral
                });
                break;
            }
            default: {
                throw new Error(`No operation for the form id ${form_id} was found`);
            }
        }
    }
}
