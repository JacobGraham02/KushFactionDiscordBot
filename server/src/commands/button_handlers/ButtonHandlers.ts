import {ButtonInteraction, MessageFlags} from "discord.js";

export default class ButtonHandlers {

    constructor(private button_interaction: ButtonInteraction) {}

    /**
     * When a button click interaction occurs in Discord, there is a custom id associated with that interaction which
     * we use in a switch/case statement to send the intended reply back to discord
     */
    public async handleButtonClick(): Promise<void> {
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
