import * as dotenv from 'dotenv';
dotenv.config();

/*
Developer-defined imports
 */
import DatabaseConnectionManager from "./database/mongodb/DatabaseConnectionManager";
import ButtonHandler from "./event_handlers/button_handler/ButtonHandler";
import FormHandler from "./event_handlers/form_handler/FormHandler";
import I18nLocalisation from "./utilities/I18nLocalisation";

/*
Native imports from Node.js
 */
import path from "node:path";
import * as fs from "node:fs";

/*
Imports from external libraries
 */
import i18n from "i18next";

/*
Imports for use with the discord.js library
 */
import CustomDiscordClient from "./utilities/CustomDiscordClient";
import {
    ChannelType,
    Collection,
    Events,
    GatewayIntentBits,
    Guild,
    MessageFlags,
    REST,
    Routes
} from 'discord.js';
import {ICommand} from "./interfaces/ICommand";

/*
Variable values defined in the .env file
 */
const discord_application_id: string | undefined = process.env.BOT_APPLICATION_ID;
const discord_client_id: string | undefined = process.env.BOT_CLIENT_ID;
const discord_client_secret: string | undefined = process.env.BOT_CLIENT_SECRET;

const database_username: string | undefined = process.env.USERNAME;
const database_password: string | undefined = process.env.PASSWORD;
const database_connection_string: string | undefined = process.env.MONGODB_CONNECTION_STRING;
const database_name: string | undefined = process.env.DATABASE_NAME;
const database_collection_name: string | undefined = process.env.DATABASE_COLLECTION_NAME;

const kush_faction_server_id: string | undefined = process.env.KUSH_FACTION_ID;
const kush_faction_the_ogs_role_id: string | undefined = process.env.KUSH_THE_OGS_ROLE_ID;
const kush_faction_kush_boys_role_id: string | undefined = process.env.KUSH_KUSH_BOYS_ROLE_ID;
const kush_faction_treasure_toker_role_id: string | undefined = process.env.KUSH_TREASURE_TOKER_ROLE_ID;
const kush_faction_buy_click_on_blu_ray_dvd_role_id: string | undefined = process.env.KUSH_BUY_CLICK_ON_BLU_RAY_DVD_ROLE_ID;
const kush_faction_big_pimpin_role_id: string | undefined = process.env.KUSH_BIG_PIMPIN_ROLE_ID;

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
              const command_class: any = command.default;

              if (typeof command_class === "function") {
                  const command_instance: ICommand = new command_class();
                  discord_client_instance.discord_commands.set(
                      command_instance.data.name,
                      command_instance
                  );
                  commands.push(command_instance.data);
              }
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
              const rest = new REST({version:"10"}).setToken(botId);

              try {
                  await rest.put(Routes.applicationGuildCommands(botId, guildId), {
                      body: commands,
                  });
              } catch (error) {
                  throw error;
              }
       }
}

/**
 * The event InteractionCreate is emitted by the Discord bot whenever an interaction is done against it (a user attempts to use a bot command).
 * This function will take the name of that command, search for it in any cached commands it has, and attempt to call the 'execute' function that is
 * within the found command object.
 */
discord_client_instance.on(Events.InteractionCreate,
    /**
     * The asynchronous function that is triggered when the InteractionCreate event is emitted
     * @param interaction the interaction object that is passed from the InteractionCreate event into this function
     */
    async(interaction): Promise<void> => {
        if (interaction.isButton()) {
            try {
                const button_handler = new ButtonHandler(interaction);
                await button_handler.handle();
            } catch (error) {
                if (!interaction.replied) {
                    await interaction.reply({
                        content: `There was an error when attempting to process your button click. Please try again or inform the bot administrator: ${error}`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        } else if (interaction.isModalSubmit()) {
            try {
                const form_handler = new FormHandler(interaction);
                await form_handler.handle();
            } catch (error) {
                if (!interaction.replied) {
                    await interaction.reply({
                        content: `There was an error when attempting to process your form submission. Please try again or inform the bot administrator: ${error}`,
                        flags: MessageFlags.Ephemeral
                    })
                }
            }
        } else if (interaction.isChatInputCommand()) {
            const user_command: ICommand | undefined = discord_client_instance.discord_commands.get(
                interaction.commandName
            );

            if (!user_command) {
                interaction.reply({
                    content: `The command you have used does not exist. Please try again or use another command`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const command_role_authorizations: string[] = user_command.authorization_role_name;

            if (!determineIfUserCanUseCommand(interaction.member, command_role_authorizations)) {

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
        }



        // const command_execute_authorization: string[] = user_command.authorization_role_name;
});

discord_client_instance.on(Events.GuildCreate,
    /**
     * The asynchronous function that is triggered when the GuildCreate event is triggered
     * @param guild
     */
    async (guild): Promise<void> => {


});

async function createBotCategoryAndChannels(guild: Guild): Promise<void> {
    try {
        const category_creation_response = await guild.channels.create({
            name: `APA Season 10 bot`,
            type: ChannelType.GuildCategory
        });

        const channel_names = [
            "Faction goals",
            "Resource storage",
            "PZfans maps",
            "Farming channel",
            "Areas last looted",
            "Feedback"
        ];
    } catch (error) {

    }
}

function determineIfUserCanUseCommand(client: any, client_role: string[]): boolean {
    return client.roles.cache.has()
}
