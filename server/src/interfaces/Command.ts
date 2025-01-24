/*
This interface specifies which options are available when creating a custom command that can be used with the Discord Bot
 */
export interface Command {
    name: string;
    description: string;
    execute: (args: any) => void;
}
