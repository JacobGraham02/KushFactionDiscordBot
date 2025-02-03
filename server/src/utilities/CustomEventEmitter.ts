import EventEmitter from "node:events";
import IBotDataDocument from "../models/IBotDataDocument";
import { Channel } from "discord.js";

export default class CustomEventEmitter extends EventEmitter {
    private static event_emitter_instance: CustomEventEmitter;

    /*
    Inherit existing functionality in the native Node.js event emitting system
     */
    private constructor() {
        super();
    }

    /**
     * Implementation of singleton pattern so we do not run into any problems with multiple event emitters
     */
    public static getCustomEventEmitterInstance(): CustomEventEmitter {
        if (this.event_emitter_instance) {
            this.event_emitter_instance = new CustomEventEmitter();
        }
        return this.event_emitter_instance;
    }

    /**
     * Emits an event that will trigger the application to update the bot channel data in mongodb
     * @param channel the target Discord channel at which to send the message
     * @param bot_channel_data structure of document used to update bot data
     */
    public emitUpdateBotChannelDataEvent(channel: Channel, bot_channel_data: IBotDataDocument): void {
        try {
            this.emit(`updateBotChannelData`, channel, bot_channel_data);
        } catch (error) {
            throw error;
        }
    }
}
