/**
 * The expected structure of any faction goal data (e.g., land claim cost, cost for bushmaster, etc.)
 */
export interface IFactionGoals {
    faction_id: string;
    goal_name: string
    description?: string;
    status: "pending" | "in progress" | "completed" | "TBA";
}
