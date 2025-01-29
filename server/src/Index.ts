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
    CategoryChannel,
    ChannelType,
    Collection,
    Events,
    GatewayIntentBits,
    Guild,
    MessageFlags,
    REST,
    Routes, TextChannel
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
                    return;
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
                    });
                    return;
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

            try {
                if (determineIfUserCanUseCommand(interaction.member, command_role_authorizations)) {
                    user_command.execute(interaction);
                } else {
                    const authorized_roles = createListOfRoles(command_role_authorizations)
                    await interaction.reply({
                        content: `You must have one of the following roles to use this command: ${authorized_roles}`,
                        flags: MessageFlags.Ephemeral
                    })
                    return;
                }
            } catch (error) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({content: `There was an error while executing this command. Please inform the bot developer: ${error}`, flags: MessageFlags.Ephemeral});
                    return;
                } else {
                    await interaction.followUp({content: `There was an error while executing this command. Please inform the bot developer: ${error}`, flags: MessageFlags.Ephemeral});
                    return;
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
    async (guild: Guild): Promise<void> => {
        try {
            /**
             * TODO: Insert check using database class to see if a document with the guild id already exists before attempting to create category and channels
             */
            await createBotCategoryAndChannels(guild);
        } catch (error) {
            console.error(`There was an error when attempting to create a new category and channels within Discord`);
            return;
        }
});

/**
 * Creates a new category and several channels within that category for the bot to use
 * @param guild the Guild (server) on Discord
 */
async function createBotCategoryAndChannels(guild: Guild): Promise<void> {
    try {
        const category_creation_response: CategoryChannel = await guild.channels.create({
            name: `APA Season 10 bot`,
            type: ChannelType.GuildCategory
        });

        const discord_channel_ids: Map<string, string> = new Map<string, string>();
        discord_channel_ids.set("guild_id", guild.id);

        const channel_names: string[] = [
            "Faction goals",
            "Resource storage",
            "PZfans maps",
            "Farming channel",
            "Areas last looted",
            "Feedback"
        ];

        const mongodb_field_names: string[] = [
            "discord_faction_goals_channel_id",
            "discord_resource_storage_channel_id",
            "discord_pzfans_maps_channel_id",
            "discord_farming_channel_id",
            "discord_areas_looted_channel_id",
            "discord_feedback_channel_id"
        ];

        for (let i: number = 0; i < channel_names.length; i++) {
            const channel_name: string = channel_names[i];
            if (channel_name) {
                const created_channel: TextChannel = await guild.channels.create({
                    name: `${channel_name}`,
                    type: ChannelType.GuildText,
                    parent: category_creation_response.id
                });
                const mongodb_channel_id_fields: string = mongodb_field_names[i];
                discord_channel_ids.set(mongodb_channel_id_fields, created_channel.id);
            }
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Returns if a user has permission to execute a command based on the values in the authorization_role_name array associated with that command
 * @param client the guild member from Discord who interacted with the bot
 * @param client_authorization_role_array an array of strings that shows what role a user must have to execute that command
 * @return if the user can use that command
 */
function determineIfUserCanUseCommand(client: any, client_authorization_role_array: string[]): boolean {
    return client.roles.cache.some((role: string) => client_authorization_role_array.includes(role));
}

/**
 * Creates a list of human-readable roles who have permissions to execute a given command
 * @param roles an array of strings that hold all roles
 * @return string that contains what roles can execute this command
 */
function createListOfRoles(roles: string[]): string {
    let roles_allowed_sentence: string = "";
    for (let i = 0; i < roles.length - 1; i++) {
        roles_allowed_sentence += roles[i];
        roles_allowed_sentence += ", ";
    }
    roles_allowed_sentence += `or ${roles[roles.length-1]}`;
    return roles_allowed_sentence;
}
