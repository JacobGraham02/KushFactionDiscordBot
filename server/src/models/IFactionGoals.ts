/**
 * The expected structure of any faction goal data (e.g., land claim cost, cost for bushmaster, etc.)
 */
export interface IFactionGoals {
    [goal_name: string]: {
        description?: string;
        resources?: {
            mpc_value?: number;
            gold_bullion?: number;
            silver_bullion?: number;
            [resource_name: string]: number | undefined;
        };
        status?: "pending" | "in progress" | "completed" | "TBA";
    }
}
