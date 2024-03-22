export interface CreateAdEventRequest {
    bid: string,
    content: string,
    mediaUrl?: string,
    description?: string,
    redirectUrl?: string,
    includeClickThroughLink?: boolean,
}