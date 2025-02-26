import {MessageFlags, SlashCommandBuilder} from "discord.js";
import {ICommand} from "../interfaces/ICommand";
import CustomEventEmitter from "../utilities/CustomEventEmitter";

export default class ShowBotChannelData implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('show-bot-data')
        .setDescription('Displays bot channel data')
    authorization_role_name: string[] = [];

    async execute(interaction: any): Promise<void> {
        const custom_event_emitter: CustomEventEmitter = CustomEventEmitter.getCustomEventEmitterInstance();
        const current_channel_id: string = interaction.channel.id;

        try {
            custom_event_emitter.emitShowBotChannelDataEvent(current_channel_id);

            await interaction.reply({
                content: `Bot channel data will be showed shortly`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            throw error;
        }
    }
}
