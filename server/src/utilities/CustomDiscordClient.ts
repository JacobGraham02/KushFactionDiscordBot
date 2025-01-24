import {Client, ClientOptions, Collection} from 'discord.js';
import {Command} from "../interfaces/Command";

/*
This class is used to create a custom Discord client that supports additional functionality that is not found in the traditional Discord.js Client class.
 */
export default class CustomDiscordClient extends Client {
    discord_commands: Collection<string, Command>;
    constructor(options: ClientOptions) {
        super(options);
        this.discord_commands = new Collection();
    }
}

