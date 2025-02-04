/**
 * The expected structure of any faction character build (e.g., early game wipe build, doctor build, etc.)
 */
export default interface IFactionTraitBuild {
    discord_user_id: string;
    discord_username: string;
    profession: string;
    positive_traits: string[];
    negative_traits: string[];
}
