/**
 * The expected structure of any faction goal data (e.g., go fight through Coryerdon bridge, loot Rabbit Hash, etc.)
 */
export default interface IFactionResources {
    [resource_name: string]: {
        amount?: number;
    }
}
