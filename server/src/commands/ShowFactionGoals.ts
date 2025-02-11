import {ICommand} from "../interfaces/ICommand";
import {MessageFlags, SlashCommandBuilder} from "discord.js";
import CustomEventEmitter from "../utilities/CustomEventEmitter";

export default class ShowFactionGoals implements ICommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName('show_faction_goals')
        .setDescription('Displays faction goals in an embedded message')
    authorization_role_name: string[] = [""];

    async execute(interaction: any): Promise<void> {
        const custom_event_emitter: CustomEventEmitter = CustomEventEmitter.getCustomEventEmitterInstance();
        const current_channel_id: string = interaction.channel.id;

        try {
            custom_event_emitter.emitShowFactionGoalsEvent(current_channel_id);

            await interaction.reply({
                content: `Faction goals will be showed shortly`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            throw error;
        }
    }
}
