import createClient from "openapi-fetch";
import { paths, components } from "./schemas/folksonomy";
import { ApiError } from "./error";
export type FolksonomyTag = components["schemas"]["ProductTag"];
export type FolksonomyKey = {
    k: string;
    count: number;
    values: number;
};
export declare class Folksonomy {
    private readonly fetch;
    private readonly baseUrl;
    private authToken?;
    readonly raw: ReturnType<typeof createClient<paths>>;
    constructor(fetch: typeof global.fetch, authToken?: string);
    private validateAuthToken;
    /**
     * Get the list of keys with statistics
     *
     * The keys list can be restricted to private tags from some owner.
     */
    getKeys(): Promise<FolksonomyKey[]>;
    /**
     * Get the list of products that have a `key` or `key=value` if `value` is provided
     */
    getProducts(key: string, value?: string): Promise<FolksonomyTag[]>;
    putTag(tag: FolksonomyTag): Promise<boolean>;
    /**
     * Get a list of existing tags for a product
     */
    getProduct(barcode: string): Promise<import("openapi-fetch").FetchResponse<{
        parameters: {
            query?: {
                owner?: unknown;
            };
            path: {
                product: string;
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": components["schemas"]["ProductTag"][];
                };
            };
            422: {
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }, {
        params: {
            path: {
                product: string;
            };
        };
    }, `${string}/${string}`>>;
    /**
     * Update a product tag (or add it if it does not exist)
     *
     * @param tag Tag to add or update with the following fields:
     * - `k`: key
     * - `v`: value
     * - `product`: barcode
     * - `version`: version of the tag (must be equal to previous version + 1)
     * - `owner`: user_id of the owner of the tag (empty for public tags)
     *
     * @returns if the tag was added or updated
     */
    addTag(tag: FolksonomyTag): Promise<boolean>;
    /**
     * Delete a product tag
     *
     * @returns if the tag was deleted
     */
    removeTag(tag: FolksonomyTag & {
        version: number;
    }): Promise<import("openapi-fetch").FetchResponse<{
        parameters: {
            query: {
                version: number;
                owner?: unknown;
            };
            path: {
                product: string;
                k: string;
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }, {
        params: {
            path: {
                product: string;
                k: string;
            };
            query: {
                version: number;
            };
        };
    }, `${string}/${string}`>>;
    /**
     * Authentication: provide user/password and get a bearer token in return
     *
     * @param username Open Food Facts user_id (not email)
     * @param password user password
     * @returns the bearer token, to be used in later requests with usual "Authorization: bearer token" headers
     */
    login(username: string, password: string): Promise<{
        token: {
            access_token: string;
            token_type: string;
        };
    } | {
        error: ApiError;
    }>;
}
