import * as dotenv from 'dotenv';
dotenv.config();

/*
Developer-defined imports
 */
import DatabaseConnectionManager from "./database/mongodb/DatabaseConnectionManager";
import ButtonHandler from "./event_handlers/button_handler/ButtonHandler";
import FormHandler from "./event_handlers/form_handler/FormHandler";
import I18nLocalisation from "./utilities/I18nLocalisation";
import CustomEventEmitter from "./utilities/CustomEventEmitter";

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
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    CategoryChannel,
    Channel,
    ChannelType,
    Collection, EmbedBuilder,
    Events,
    GatewayIntentBits,
    Guild,
    MessageFlags,
    REST,
    Routes, StringSelectMenuInteraction, TextChannel
} from 'discord.js';
import {ICommand} from "./interfaces/ICommand";
import {BotDataRepository} from "./database/mongodb/repository/BotDataRepository";
import IBotDataDocument from "./models/IBotDataDocument";
import {UpdateResult} from "mongodb";
import {ECollections} from "./enums/ECollections";
import {IFactionGoals} from "./models/IFactionGoals";
import SelectMenuHandler from "./event_handlers/select_menu_handler/SelectMenuHandler";

/*
Variable values defined in the .env file
 */
const discord_application_id: string | undefined = process.env.BOT_APPLICATION_ID;
const discord_client_id: string | undefined = process.env.BOT_CLIENT_ID;
const discord_client_secret: string | undefined = process.env.BOT_CLIENT_SECRET;
const discord_bot_token: string | undefined = process.env.BOT_TOKEN;

const database_connection_username: string | undefined = process.env.USERNAME;
const database_connection_password: string | undefined = process.env.PASSWORD;
const database_connection_string: string | undefined = process.env.MONGODB_CONNECTION_STRING;
const database_name: string | undefined = process.env.DATABASE_NAME;
const database_collection_name: string | undefined = process.env.DATABASE_COLLECTION_NAME;
const database_connection_min_pool_size: number | undefined = process.env.DATABASE_CONNECTION_MIN_POOL_SIZE;
const database_connection_max_pool_size: number | undefined = process.env.DATABASE_CONNECTION_MAX_POOL_SIZE;

const kush_faction_server_id: string | undefined = process.env.KUSH_FACTION_ID;
const kush_faction_the_ogs_role_id: string | undefined = process.env.KUSH_THE_OGS_ROLE_ID;
const kush_faction_kush_boys_role_id: string | undefined = process.env.KUSH_KUSH_BOYS_ROLE_ID;
const kush_faction_treasure_toker_role_id: string | undefined = process.env.KUSH_TREASURE_TOKER_ROLE_ID;
const kush_faction_buy_click_on_blu_ray_dvd_role_id: string | undefined = process.env.KUSH_BUY_CLICK_ON_BLU_RAY_DVD_ROLE_ID;
const kush_faction_big_pimpin_role_id: string | undefined = process.env.KUSH_BIG_PIMPIN_ROLE_ID;

const test_channel_id: string | undefined = process.env.TEST_CHANNEL_ID;

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
let database_repository: BotDataRepository;
let database_connection_manager: DatabaseConnectionManager;
let custom_event_emitter: CustomEventEmitter = CustomEventEmitter.getCustomEventEmitterInstance();

/**
 * This function must be asynchronous because it reads files from a specified directory, which takes an unknown amount of time
 */
async function loadSetupCommandsIntoCollection(): Promise<void> {
    const commands_folder_path: string = path.join(__dirname, "../dist/commands");
    const filtered_command_files: string[] = fs.
    readdirSync(commands_folder_path)
        .filter((file: string): boolean => file !== "deploy-commands.ts" && file.endsWith(".js"));
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
 * @param bot_token the token for the bot as it exists on Discord
 * @param bot_application_id the id of the bot as it exists on Discord
 * @param guild_id the id of the server as it exists on Discord
 */
async function registerSetupCommandsWithBot(bot_token: string, bot_application_id: string, guild_id: string): Promise<void> {
       if (bot_token && bot_application_id && guild_id) {
              const rest = new REST({version:"10"}).setToken(bot_token);

              try {
                  await rest.put(Routes.applicationGuildCommands(bot_application_id, guild_id), {
                      body: commands,
                  });
              } catch (error) {
                  throw error;
              }
       }
}

/**
 * Returns a created BotDataRepository class instance so that we can interact with the MongoDB database.
 */
async function createDatabaseConnection(): Promise<void> {
    database_connection_manager = new DatabaseConnectionManager(
        database_connection_string,
        database_connection_min_pool_size,
        database_connection_max_pool_size,
        database_name,
        null,
    );

    await database_connection_manager.initializeMongodbDatabaseInstance();

    if (!database_connection_manager.database_instance) {
        throw new Error(`The database instance could not be initialized`);
    }

    database_repository = new BotDataRepository(
        database_connection_manager.database_instance,
        ECollections.BOT_DATA
    );
}

async function closeDatabaseConnection(): Promise<void> {
    try {
        await database_connection_manager.closeMongodbDatabaseInstanceConnectionPool();
    } catch (error) {
        throw error;
    }
}

/**
 * The event ClientReady is emitted by the Discord bot whenever the bot is activated
 */
discord_client_instance.on(Events.ClientReady,
    /**
     * The asynchronous function that is triggered when the bot process is started
     * Because CustomEventEmitter is a singleton and has a static method to retrieve the connection,
     * we do not have to use the 'new' keyword for instantiation
     */
    async(): Promise<void> => {
        console.log("Bot is ready");
        // try {
        //     if (channel && channel.isSendable()) {
        //         channel.send({
        //             content: `The bot is online!`,
        //         });
        //     }
        // } catch (error) {
        //     if (channel && channel.isSendable()) {
        //         channel.send({
        //             content: `There was an error when attempting to start the bot: ${error}`,
        //         });
        //     }
        // }
});

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
                await button_handler.handle(database_repository, kush_faction_server_id);
            } catch (error) {
                if (!interaction.replied) {
                    await interaction.reply({
                        content: `There was an error when attempting to process your button click. Please try again or inform the bot administrator: ${error}`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            try {
                const select_menu_handler = new SelectMenuHandler(interaction);
                await select_menu_handler.handle();
            } catch (error) {
                if (!interaction.replied) {
                    await interaction.reply({
                       content: `There was an error when attempting to list this map. Please try again or inform the bot administrator: ${error}`,
                       flags: MessageFlags.Ephemeral
                    });
                    return;
                }
            }
        } else if (interaction.isModalSubmit()) {
            try {
                const form_handler = new FormHandler(interaction);
                await form_handler.handle(database_repository, kush_faction_server_id);
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

            const required_roles: string[] = user_command.authorization_role_name;

            if (required_roles.length > 0) {
                if (!(determineIfUserCanUseCommand(interaction.member, required_roles))) {
                    const authorized_roles: string = createListOfRoles(required_roles)
                    await interaction.reply({
                        content: `You must have one of the following roles to use this command: ${authorized_roles}`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
            }

            try {
                await user_command.execute(interaction);
            } catch (error) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: `There was an error while executing this command. Please inform the bot developer: ${error}`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                } else {
                    await interaction.reply({
                        content: `There was an error while executing this command. Please inform the bot developer: ${error}`,
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
            }
        }
});

discord_client_instance.on(Events.GuildCreate,
    /**
     * The asynchronous function that is triggered when the GuildCreate event is triggered
     * @param guild
     */
    async (guild: Guild): Promise<void> => {
        if (database_repository) {
            await closeDatabaseConnection();
        }
        await createDatabaseConnection();
        try {
            if (guild) {
                // await createBotCategoryAndChannels(guild);
            }
            await loadSetupCommandsIntoCollection();
            if (discord_bot_token) {
                await registerSetupCommandsWithBot(discord_bot_token, discord_application_id, kush_faction_server_id);
            }
        } catch (error) {
            throw error;
        }
});

discord_client_instance.login(discord_bot_token);

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

        const bot_data: IBotDataDocument = {}
        const discord_channel_ids: Map<string, string> = new Map<string, string>();
        discord_channel_ids.set("discord_guild_id", guild.id);

        const channel_names: string[] = [
            "Faction goals",
            "Resource storage",
            "PZfans maps",
            "Farming channel",
            "Areas last looted",
        ];

        const mongodb_field_names: string[] = [
            "discord_faction_goals_channel_id",
            "discord_resource_storage_channel_id",
            "discord_pzfans_maps_channel_id",
            "discord_farming_channel_id",
            "discord_areas_looted_channel_id",
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

        bot_data.discord_guild_id = discord_channel_ids.get("discord_guild_id");
        bot_data.discord_faction_goals_channel_id = discord_channel_ids.get("discord_faction_goals_channel_id");
        bot_data.discord_resource_storage_channel_id = discord_channel_ids.get("discord_resource_storage_channel_id");
        bot_data.discord_pzfans_maps_channel_id = discord_channel_ids.get("discord_pzfans_maps_channel_id");
        bot_data.discord_farming_channel_id = discord_channel_ids.get("discord_farming_channel_id");
        bot_data.discord_areas_looted_channel_id = discord_channel_ids.get("discord_areas_looted_channel_id");

        await database_repository.create(bot_data)
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
    for (let i: number = 0; i < roles.length - 1; i++) {
        roles_allowed_sentence += roles[i];
        roles_allowed_sentence += ", ";
    }
    roles_allowed_sentence += `or ${roles[roles.length-1]}`;
    return roles_allowed_sentence;
}

/*******************************************************************/
/*  Beginning of custom event emitter functions                    */
/*******************************************************************/
custom_event_emitter.on("updateBotChannelData",
    /**
     * When a bot administrator attempts to update the channel data associated with the bot, this event will trigger
     * @param channel the target Discord channel
     * @param bot_channel_data_document the structure of the document containing the bot channel data
     */
    async(channel: Channel, bot_channel_data_document: IBotDataDocument): Promise<void> => {
        try {
            const create_bot_data_response: UpdateResult<any> = await database_repository.create(bot_channel_data_document);
            if (channel.isSendable()) {
                channel.send({
                    content: `Bot has been updated with new Discord channel ids`
                });
            }
        } catch (error) {
            throw error;
        }
    });

custom_event_emitter.on("showFactionGoals",

    async(channel_id: string): Promise<void> => {
        try {
            const show_faction_goals_response: IFactionGoals[] | null = await database_repository.getFactionGoals(kush_faction_server_id);
            const channel: Channel | undefined = discord_client_instance.channels.cache.get(channel_id);
            if (!channel) {
                throw new Error(`The channel in which to send the faction goals is undefined`);
            }
            if (show_faction_goals_response && channel.isSendable()) {
                for (const { faction_id, goal_name, description, status } of Object.values(show_faction_goals_response)) {
                    const embedded_message_builder: EmbedBuilder = new EmbedBuilder()
                        .setTitle("Faction goals")
                        .setColor(0x00AE86)
                        .setDescription("Goals")
                        .addFields(
                            {name: "Name:", value: goal_name},
                            {name: "Description:", value: description ?? "No description available"},
                            {name: "Status:", value: status ?? "TBA"})
                        .setThumbnail("https://www.dropbox.com/scl/fi/e1q046ct1haaes6lrdb70/DiscordBotImage.png?rlkey=wgmkewc9q030rkucow71ljepo&st=gtcghwx0&dl=0")
                        .setTimestamp()
                        .setFooter({
                            text: 'Kush faction Discord bot',
                            iconURL: "https://www.dropbox.com/scl/fi/e1q046ct1haaes6lrdb70/DiscordBotImage.png?rlkey=wgmkewc9q030rkucow71ljepo&st=gtcghwx0&dl=0"
                        });

                    const update_button: ButtonBuilder = new ButtonBuilder()
                        .setCustomId(`update_goal_${goal_name}`)
                        .setLabel("Update Goal")
                        .setStyle(ButtonStyle.Primary)

                    const delete_button: ButtonBuilder = new ButtonBuilder()
                        .setCustomId(`delete_goal_${goal_name}`)
                        .setLabel("Delete Goal")
                        .setStyle(ButtonStyle.Danger)

                    const button_action_row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(update_button, delete_button);

                    channel.send({embeds: [embedded_message_builder], components: [button_action_row]});
                }
            }
        } catch (error) {
            throw error;
        }
    });

custom_event_emitter.on("showBotChannelData",

    async(channel_id: string): Promise<void> => {
        try {
            const show_bot_channel_data: IBotDataDocument | null = await database_repository.findById(kush_faction_server_id);
            const channel: Channel | undefined = discord_client_instance.channels.cache.get(channel_id);
            if (!channel) {
                throw new Error(`The channel in which to send the bot data is undefined`);
            }
            if (!show_bot_channel_data) {
                throw new Error(`The bot data document is undefined or not registered with the bot`);
            }
            if (show_bot_channel_data && channel.isSendable()) {
                const embedded_message_builder: EmbedBuilder = new EmbedBuilder()
                    .setTitle("Bot channel data")
                    .setColor(0x00AE86)
                    .setDescription("Bot data")
                    .addFields(
                        {name: "Guild id:", value: `${show_bot_channel_data.discord_guild_id}`},
                        {name: "Goals channel id:", value: `${show_bot_channel_data.discord_faction_goals_channel_id}`},
                        {name: "Resources channel id:", value: `${show_bot_channel_data.discord_resource_storage_channel_id}`},
                        {name: "Pzfans maps channel id:", value: `${show_bot_channel_data.discord_pzfans_maps_channel_id}`},
                        {name: "Farming channel id:", value: `${show_bot_channel_data.discord_farming_channel_id}`},
                        {name: "Areas looted channel id:", value: `${show_bot_channel_data.discord_areas_looted_channel_id}`})
                    .setThumbnail("https://www.dropbox.com/scl/fi/e1q046ct1haaes6lrdb70/DiscordBotImage.png?rlkey=wgmkewc9q030rkucow71ljepo&st=gtcghwx0&dl=0")
                    .setTimestamp()
                    .setFooter({
                        text: 'Kush faction Discord bot',
                        iconURL: "https://www.dropbox.com/scl/fi/e1q046ct1haaes6lrdb70/DiscordBotImage.png?rlkey=wgmkewc9q030rkucow71ljepo&st=gtcghwx0&dl=0"
                    });

                const update_button: ButtonBuilder = new ButtonBuilder()
                    .setCustomId(`update_bot_data_${show_bot_channel_data.discord_guild_id}`)
                    .setLabel("Update Bot Data")
                    .setStyle(ButtonStyle.Primary)

                const button_action_row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(update_button);

                channel.send({embeds: [embedded_message_builder], components: [button_action_row]});
            }
        } catch (error) {
            throw error;
        }
    });
