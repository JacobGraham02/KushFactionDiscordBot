import {Interaction} from "discord.js";
import {BotDataRepository} from "../database/mongodb/repository/BotDataRepository";

/**
 * Abstract class which enables polymorphism between different handler classes, as each type of interaction in Discord
 * (ModalSubmitInteraction, ButtonInteraction, etc.) inherits from the base Interaction class.
 */
export default abstract class InteractionHandler {
    /**
     * Interaction is the base class with which each Discord interaction inherits from
     * @param interaction a specific interaction done by a Discord user
     */
    constructor(protected interaction: Interaction) {}

    abstract handle(database_repository?: BotDataRepository, faction_id?: string): Promise<void>;
}
