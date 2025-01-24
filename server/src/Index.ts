import * as dotenv from 'dotenv';
dotenv.config();

/*
Imports for use with the discord.js library
 */
import CustomDiscordClient from "./utilities/CustomDiscordClient";
import {Collection, GatewayIntentBits} from 'discord.js';

const client: CustomDiscordClient = new CustomDiscordClient({
       intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildPresences
       ]
});


