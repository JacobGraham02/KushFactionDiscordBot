import * as dotenv from 'dotenv';
dotenv.config();

/*
Imports for use with the discord.js library
 */
import CustomDiscordClient from "./utilities/CustomDiscordClient";
import {Collection, GatewayIntentBits, REST, Routes} from 'discord.js';
import path from "node:path";
import * as fs from "node:fs";

/*
Variable values defined in the .env file
 */
const discord_bot_token: string | undefined = process.env.discord_bot_token;
const discord_guild_id: string | undefined = process.env.discord_bot_guild_id;

/**
 * Declaration of custom discord client
 */
const discord_client_instance: CustomDiscordClient = new CustomDiscordClient({
       intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildPresences
       ]
});

/*
Declaration of application variables
 */
const commands: any[] = [];

/**
 * This function must be asynchronous because it reads files from a specified directory, which takes an unknown amount of time
 * @param botId the string that represents the id of the bot as it exists on Discord
 * @param guildId the string that represents the id of the guild (server) as it exists on Discord
 */
async function loadSetupCommandsIntoCollection() {
       const commands_folder_path: string = path.join(__dirname, "../dist/commands");
       const filtered_command_files: string[] = fs.
              readdirSync(commands_folder_path)
              .filter((file) => file !== "deploy-commands.ts" && file.endsWith(".js"));
       discord_client_instance.discord_commands = new Collection();

       for (const command_file of filtered_command_files) {
              const command_file_path: any = path.join(commands_folder_path, command_file);
              const command: any = await import(command_file_path);
              const command_object = command.default();

              discord_client_instance.discord_commands.set(
                  command_object.data.name,
                  command_object
              );

              commands.push(command_object.data);
       }
}

async function registerSetupCommandsWithBot(botId: string, guildId: string) {
       if (botId && guildId) {
              const rest = new REST({}).setToken(botId);
              rest.put(Routes.applicationGuildCommands(botId, guildId), {
                     body: commands,
              })
                  .then(() => {
                        console.log("The application commands were successfully deployed to the Discord bot");
                  })
                  .catch((error) => {
                         console.log(`There was an error when attempting to deploy the application comamnds to the Discord bot: ${error}`);
                  })
       }
}
