import createClient from "openapi-fetch";
import { components, paths } from "./schemas/nutripatrol";
import { NutriPatrolError } from "./error";
export type Flag = components["schemas"]["FlagCreate"];
export type Ticket = components["schemas"]["Ticket"];
export type FlagResponse = {
    __data__: Flag;
    _dirty: any[];
    __rel__: object;
};
export type FlagsResponse = {
    flags: Flag[];
};
export type FlagBatchResponse = {
    ticket_id_to_flags: {
        [ticketId: string]: Flag[];
    };
};
export type TicketsResponse = {
    tickets: Ticket[];
};
export declare class NutriPatrol {
    private readonly fetch;
    private readonly baseUrl;
    readonly raw: ReturnType<typeof createClient<paths>>;
    constructor(fetch: typeof global.fetch);
    private fetchApi;
    /**
     * List all flags.
     *
     * @returns {Promise<Flag[] | NutriPatrolError>} - A promise that resolves with the list of flag data or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid flag ID).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    getFlags(): Promise<Flag[] | NutriPatrolError>;
    /**
     * Retrieves a specific flag by its ID from the NutriPatrol API.
     *
     * @param {number} flagId - The ID of the flag to fetch.
     * @returns {Promise<Flag | NutriPatrolError>} - A promise that resolves with the flag data if found or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid flag ID).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    getFlagById(flagId: number): Promise<Flag | NutriPatrolError>;
    /**
     * Create a flag in the NutriPatrol API.
     *
     * @param {Flag} flagData - Data for the flag to create.
     * @returns {Promise<Flag | NutriPatrolError>} - A promise that resolves with the flag created or error..
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid flag ID).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    createFlag(flagData: Flag): Promise<Flag | NutriPatrolError>;
    /**
     * Get flags by ticket batch.
     *
     * @param {number[]} ticketIds - Ids of ticket to get flags from.
     * @returns {Promise<{ [ticketId: string]: Flag[] } | NutriPatrolError>} - A promise that resolves with the flags associated to each ticket or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid flag ID).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    getFlagsByTicketBatch(ticketIds: number[]): Promise<{
        [ticketId: string]: Flag[];
    } | NutriPatrolError>;
    /**
     * List all tickets.
     *
     * @param {object} query - Parameters to filter the tickets.
     * @returns {Promise<Ticket[] | NutriPatrolError>} - A promise that resolves with the list of ticket data or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid filter value).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    getTickets(query: {
        status: "open" | "closed";
        type?: string;
        reason?: "inappropriate" | "human" | "beauty" | "other";
        page?: number;
        page_size?: number;
    }): Promise<Ticket[] | NutriPatrolError>;
    /**
     * Retrieves a specific ticket by its ID from the NutriPatrol API.
     *
     * @param {number} ticketId - The ID of the ticket to fetch.
     * @returns {Promise<Ticket | NutriPatrolError>} - A promise that resolves with the ticket data if found or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid ticket ID).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    getTicketById(ticketId: number): Promise<Ticket | NutriPatrolError>;
    /**
     * Create a ticket in the NutriPatrol API.
     *
     * @param {Ticket} ticketData - Data for the ticket to create.
     * @returns {Promise<Ticket | NutriPatrolError>} - A promise that resolves with the ticket created or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid ticket status).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    createTicket(ticketData: Omit<Ticket, "id">): Promise<Ticket | NutriPatrolError>;
    /**
     * Update a ticket status in the NutriPatrol API.
     *
     * @param {number} ticketId - The ID of the ticket to update.
     * @param {"open" | "closed"} status - The new status of the ticket.
     * @returns {Promise<Ticket | NutriPatrolError>} - A promise that resolves with the ticket updated or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with status 422 if there is a validation issue (e.g., invalid ticket status).
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    updateTicketStatus(ticketId: number, status: "open" | "closed"): Promise<Ticket | NutriPatrolError>;
    /**
     * Get the status of the NutriPatrol API.
     *
     * @returns {Promise<{ status: string } | NutriPatrolError>} - A promise that resolves with the API status or error.
     *
     * The error can be one of the following:
     * - A `NutriPatrolError` with the corresponding HTTP status code for other types of errors (e.g., 404, 500).
     * - A generic `NutriPatrolError` with status 500 for unexpected errors.
     *
     */
    getApiStatus(): Promise<{
        status: string;
    } | NutriPatrolError>;
}
