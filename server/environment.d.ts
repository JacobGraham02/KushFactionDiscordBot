/**
 * Global TypeScript definition file which states the variable type of each
 * value in the .env file.
 */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            USERNAME: string;
            PASSWORD: string;
            MONGODB_CONNECTION_STRING: string;
            DATABASE_NAME: string;
            DATABASE_COLLECTION_NAME: string;
            DATABASE_CONNECTION_MIN_POOL_SIZE: number;
            DATABASE_CONNECTION_MAX_POOL_SIZE: number;
            BOT_APPLICATION_ID: string;
            BOT_CLIENT_ID: string;
            BOT_CLIENT_SECRET: string;
            KUSH_FACTION_ID: string;
            KUSH_THE_OGS_ROLE_ID: string;
            KUSH_KUSH_BOYS_ROLE_ID: string;
            KUSH_TREASURE_TOKER_ROLE_ID: string;
            KUSH_3AM_ROLE_ID: string;
            KUSH_EMOJI_MAN_ROLE_ID: string;
            KUSH_BUY_CLICK_ON_BLU_RAY_DVD_ROLE_ID: string;
            KUSH_BIG_PIMPIN_ROLE_ID: string;
            KUSH_1_GRAM_OF_WEED_ROLE_ID: string;
        }
    }
}
export {}
