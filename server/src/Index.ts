import * as dotenv from 'dotenv';
dotenv.config();

/*
Imports for use with the discord.js library
 */
import CustomDiscordClient from "./utilities/CustomDiscordClient";
import {Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes} from 'discord.js';
import path from "node:path";
import * as fs from "node:fs";

/*
Variable values defined in the .env file
 */
const discord_bot_token: string | undefined = process.env.discord_bot_token;
const discord_guild_id: string | undefined = process.env.discord_bot_guild_id;

/**
 * Declaration of custom discord client. You must explicitly define what the bot intends to do in the Discord server, so it has necessary permissions
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
Declaration of application variables. Because the Discord bot is never supposed to go offline, these variables are going to be cached and stored in a
JSON file for later retrieval if necessary
 */
const commands: any[] = [];

/**
 * This function must be asynchronous because it reads files from a specified directory, which takes an unknown amount of time
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

/**
 * This function must be asynchronous because it registers commands with a Discord bot, which takes an unknown amount of time.
 * It uses the Discord API to register these commands.
 * @param botId the id of the bot as it exists on Discord
 * @param guildId the id of the server as it exists on Discord
 */
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

/**
 * The event InteractionCreate is emitted by the Discord bot whenever an interaction is done against it (a user attempts to use a bot command).
 * This function will take the name of that command, search for it in any cached commands it has, and attempt to call the 'execute' function that is
 * within the found command object.
 */
discord_client_instance.on(Events.InteractionCreate, async(interaction) => {
       if (!interaction.isChatInputCommand()) {
              return;
       }

       const user_command = discord_client_instance.discord_commands.get(
           interaction.commandName
       );

       if (!user_command) {
              interaction.reply({content: `The command you have used does not exist. Please try again or use another command`, flags: MessageFlags.Ephemeral});
              return;
       }

       try {
              user_command.execute(interaction);
       } catch (error) {
              if (interaction.replied || interaction.deferred) {
                     await interaction.followUp({content: `There was an error while executing this command. Please inform the bot developer: ${error}`, flags: MessageFlags.Ephemeral});
              } else {
                     await interaction.followUp({content: `There was an error while executing this command. Please inform the bot developer: ${error}`, flags: MessageFlags.Ephemeral});
              }
       }
});
