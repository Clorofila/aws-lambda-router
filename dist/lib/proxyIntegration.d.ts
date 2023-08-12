import { APIGatewayEventRequestContext, APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { HttpMethod, ProcessMethod } from './EventProcessor';
import { CorsOptions } from './cors';
declare type ProxyIntegrationParams = {
    paths?: {
        [paramId: string]: string;
    };
    routePath?: string;
};
declare type ProxyIntegrationBody<T = unknown> = {
    body?: T;
};
declare type ErrorHandler = (error?: Error, request?: APIGatewayProxyEventV2, context?: APIGatewayEventRequestContext) => Promise<APIGatewayProxyStructuredResultV2 | void> | APIGatewayProxyStructuredResultV2 | void;
export declare type ProxyIntegrationEvent<T = unknown> = Omit<APIGatewayProxyEventV2, 'body'> & ProxyIntegrationParams & ProxyIntegrationBody<T>;
export declare type ProxyIntegrationResult = Omit<APIGatewayProxyStructuredResultV2, 'statusCode'> & {
    statusCode?: APIGatewayProxyStructuredResultV2['statusCode'];
};
export interface ProxyIntegrationRoute {
    path: string;
    method: HttpMethod;
    action: (request: ProxyIntegrationEvent<any>, context: APIGatewayEventRequestContext) => ProxyIntegrationResult | Promise<ProxyIntegrationResult> | string | Promise<string>;
}
export declare type ProxyIntegrationErrorMapping = {
    [reason: string]: APIGatewayProxyStructuredResultV2['statusCode'];
};
export declare type ProxyIntegrationError = {
    statusCode: APIGatewayProxyStructuredResultV2['statusCode'];
    message: string;
} | {
    reason: string;
    message: string;
};
export interface ProxyIntegrationConfig {
    onError?: ErrorHandler;
    cors?: CorsOptions | boolean;
    routes: ProxyIntegrationRoute[];
    removeBasePath?: boolean;
    debug?: boolean;
    errorMapping?: ProxyIntegrationErrorMapping;
    defaultHeaders?: APIGatewayProxyStructuredResultV2['headers'];
    proxyPath?: string;
}
export declare const process: ProcessMethod<ProxyIntegrationConfig, APIGatewayProxyEventV2, APIGatewayEventRequestContext, APIGatewayProxyStructuredResultV2>;
export {};
