import { LegacyProxyIntegrationConfig, LegacyProxyIntegrationEvent } from './lib/legacyProxyIntegration';
import { ProxyIntegrationConfig, ProxyIntegrationEvent } from './lib/proxyIntegration';
import { SnsConfig, SnsEvent } from './lib/sns';
import { SqsConfig, SqsEvent } from './lib/sqs';
import { S3Config, S3Event } from './lib/s3';
import { Context } from 'aws-lambda';
import { EventProcessor } from './lib/EventProcessor';

export interface RouteConfig {
    legacyProxyIntegration?: LegacyProxyIntegrationConfig;
    proxyIntegration?: ProxyIntegrationConfig;
    sns?: SnsConfig;
    sqs?: SqsConfig;
    s3?: S3Config;
    debug?: boolean;
    onError?: ErrorHandler;
}

export type ErrorHandler<TContext extends Context = Context> = (
    error?: Error,
    event?: RouterEvent,
    context?: TContext,
) => Promise<any> | any | void;

export type RouterEvent = LegacyProxyIntegrationEvent | ProxyIntegrationEvent | SnsEvent | SqsEvent | S3Event;

export const handler = (routeConfig: RouteConfig) => {
    const eventProcessorMapping = extractEventProcessorMapping(routeConfig);

    return async <TContext extends Context>(event: RouterEvent, context: TContext) => {
        if (routeConfig.debug) {
            console.log('Lambda invoked with request:', event);
            console.log('Lambda invoked with context:', context);
        }

        for (const [eventProcessorName, eventProcessor] of eventProcessorMapping.entries()) {
            try {
                // the contract of 'processors' is as follows:
                // - their method 'process' is called with (config, event)
                // - the method...
                //   - returns null: the processor does not feel responsible for the event
                //   - throws Error: the 'error.toString()' is taken as the error message of processing the event
                //   - returns object: this is taken as the result of processing the event
                //   - returns promise: when the promise is resolved, this is taken as the result of processing the event
                const result = eventProcessor.process((routeConfig as any)[eventProcessorName], event, context);
                if (result) {
                    // be resilient against a processor returning a value instead of a promise:
                    return await result;
                } else {
                    if (routeConfig.debug) {
                        console.log("Event processor couldn't handle request.");
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    if (error.stack) {
                        console.log(error.stack);
                    }
                    if (routeConfig.onError) {
                        const result = await routeConfig.onError(error, event, context);
                        if (result) {
                            return result;
                        }
                    }
                    throw error.toString();
                }
            }
        }
        throw 'No event processor found to handle this kind of event!';
    };
};

const extractEventProcessorMapping = (routeConfig: RouteConfig) => {
    const processorMap = new Map<string, EventProcessor>();
    for (const key of Object.keys(routeConfig)) {
        if (key === 'debug' || key === 'onError') {
            continue;
        }
        try {
            processorMap.set(key, require(`./lib/${key}`));
        } catch (error: unknown) {
            throw new Error(
                `The event processor '${key}', that is mentioned in the routerConfig, cannot be instantiated (${(
                    error as Error
                ).toString()})`,
            );
        }
    }
    return processorMap;
};
