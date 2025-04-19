import type { paths } from "$schemas/prices";
type PricesQuery = paths["/api/v1/prices"]["get"]["parameters"]["query"];
export type PricesCreate = paths["/api/v1/prices"]["post"]["requestBody"]["content"]["application/json"];
export type Prices = paths["/api/v1/prices"]["get"]["responses"]["200"]["content"]["application/json"];
export declare class PricesApi {
    private readonly client;
    constructor(fetch: typeof window.fetch, options?: {
        baseUrl: string;
    });
    getPrices(query: PricesQuery): Promise<import("openapi-fetch").FetchResponse<{
        parameters: {
            query?: {
                product_code?: string | null;
                product_id?: number | null;
                product_id__isnull?: boolean | null;
                category_tag?: string | null;
                labels_tags__like?: string | null;
                origins_tags__like?: string | null;
                location_osm_id?: number | null;
                location_osm_type?: import("$schemas/prices").components["schemas"]["LocationOSMEnum"] | null;
                location_id?: number | null;
                price?: number | null;
                price_is_discounted?: boolean | null;
                price__gt?: number | null;
                price__gte?: number | null;
                price__lt?: number | null;
                price__lte?: number | null;
                currency?: string | null;
                date?: string | null;
                date__gt?: string | null;
                date__gte?: string | null;
                date__lt?: string | null;
                date__lte?: string | null;
                owner?: string | null;
                created__gte?: string | null;
                created__lte?: string | null;
                order_by?: string | null;
                page?: number;
                size?: number;
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["Page_PriceFullWithRelations_"];
                };
            };
            422: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }, {
        params: {
            query: {
                product_code?: string | null;
                product_id?: number | null;
                product_id__isnull?: boolean | null;
                category_tag?: string | null;
                labels_tags__like?: string | null;
                origins_tags__like?: string | null;
                location_osm_id?: number | null;
                location_osm_type?: import("$schemas/prices").components["schemas"]["LocationOSMEnum"] | null;
                location_id?: number | null;
                price?: number | null;
                price_is_discounted?: boolean | null;
                price__gt?: number | null;
                price__gte?: number | null;
                price__lt?: number | null;
                price__lte?: number | null;
                currency?: string | null;
                date?: string | null;
                date__gt?: string | null;
                date__gte?: string | null;
                date__lt?: string | null;
                date__lte?: string | null;
                owner?: string | null;
                created__gte?: string | null;
                created__lte?: string | null;
                order_by?: string | null;
                page?: number;
                size?: number;
            } | undefined;
        };
    }, `${string}/${string}`>>;
    createPrice(body: PricesCreate): Promise<import("openapi-fetch").FetchResponse<{
        requestBody: {
            content: {
                "application/json": import("$schemas/prices").components["schemas"]["PriceCreateWithValidation"];
            };
        };
        responses: {
            201: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["PriceFull"];
                };
            };
            422: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }, {
        body: {
            product_code?: string | null;
            product_name?: string | null;
            category_tag?: string | null;
            labels_tags?: string[] | null;
            origins_tags?: string[] | null;
            price: number;
            price_is_discounted?: boolean;
            price_without_discount?: number | null;
            price_per?: import("$schemas/prices").components["schemas"]["PricePerEnum"] | null;
            currency: import("$schemas/prices").components["schemas"]["CurrencyEnum"];
            location_osm_id: number;
            location_osm_type: import("$schemas/prices").components["schemas"]["LocationOSMEnum"];
            date: string;
            proof_id?: number | null;
        };
    }, `${string}/${string}`>>;
    login(body: {
        username: string;
        password: string;
    }): Promise<import("openapi-fetch").FetchResponse<{
        parameters: {
            query?: {
                set_cookie?: boolean;
            };
        };
        requestBody: {
            content: {
                "application/x-www-form-urlencoded": import("$schemas/prices").components["schemas"]["Body_authentication_api_v1_auth_post"];
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
                    "application/json": import("$schemas/prices").components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }, {
        params: {
            query: {
                set_cookie: true;
            };
        };
        body: {
            username: string;
            password: string;
        };
        headers: {
            "Content-Type": string;
        };
        bodySerializer: (body: {
            grant_type?: string | null;
            username: string;
            password: string;
            scope?: string;
            client_id?: string | null;
            client_secret?: string | null;
        }) => URLSearchParams;
    }, `${string}/${string}`>>;
    uploadProof(body: {
        file: Blob;
    }): Promise<import("openapi-fetch").FetchResponse<{
        requestBody: {
            content: {
                "multipart/form-data": import("$schemas/prices").components["schemas"]["Body_upload_proof_api_v1_proofs_upload_post"];
            };
        };
        responses: {
            201: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["ProofFull"];
                };
            };
            422: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }, import("openapi-fetch").FetchOptions<{
        requestBody: {
            content: {
                "multipart/form-data": import("$schemas/prices").components["schemas"]["Body_upload_proof_api_v1_proofs_upload_post"];
            };
        };
        responses: {
            201: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["ProofFull"];
                };
            };
            422: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }>, `${string}/${string}`>>;
    getProofs(): Promise<import("openapi-fetch").FetchResponse<{
        parameters: {
            query?: {
                owner?: string | null;
                type?: import("$schemas/prices").components["schemas"]["ProofTypeEnum"] | null;
                order_by?: string | null;
                page?: number;
                size?: number;
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["Page_ProofFull_"];
                };
            };
            422: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }, import("openapi-fetch").FetchOptions<{
        parameters: {
            query?: {
                owner?: string | null;
                type?: import("$schemas/prices").components["schemas"]["ProofTypeEnum"] | null;
                order_by?: string | null;
                page?: number;
                size?: number;
            };
        };
        responses: {
            200: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["Page_ProofFull_"];
                };
            };
            422: {
                content: {
                    "application/json": import("$schemas/prices").components["schemas"]["HTTPValidationError"];
                };
            };
        };
    }> | undefined, `${string}/${string}`>>;
    isAuthenticated(): Promise<boolean>;
    getStatus(): Promise<{
        status: string;
    }>;
}
export {};
