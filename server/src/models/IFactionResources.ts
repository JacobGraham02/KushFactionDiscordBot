/**
 * The expected structure of any faction goal data (e.g., go fight through Coryerdon bridge, loot Rabbit Hash, etc.)
 */
export default interface IFactionResources {
    faction_id: string;
    resources: {
        [resource_name: string]: {
            amount?: number;
        }
    }
}
