import { APIGatewayProxyEventV2 } from 'aws-lambda';
declare type CorsOrigin = string | boolean | RegExp | Array<RegExp | string> | Function | undefined;
export interface CorsOptions {
    origin?: CorsOrigin;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    maxAge?: number;
    credentials?: boolean;
}
export declare const addCorsHeaders: (options: CorsOptions | boolean, event: APIGatewayProxyEventV2) => any;
export {};
