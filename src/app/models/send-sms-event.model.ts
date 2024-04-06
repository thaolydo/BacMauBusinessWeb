export interface AdEvent {
    bid: string, // Hash key
    createdAt: string, // Sort key
    businessName: string,
    content: string,
    mediaUrl?: string,
    redirectUrl?: string, // the url that the customer will be redirected to when clicking the link
    description?: string,
    eventSource?: string, // indicate where the event is coming from
    invalidCidCount?: number, // number of invalid customer id
    newCustomerCount?: number, // number of customers not in opt-event table
    optedOutCustomerCount?: number, // number of customers in opt-event table that has OUT status
    estimatedAudienceSize?: number, // estimated number of customers that will receive the
    successfulMessageCount?: number, // number of messages that were sent successfully
    clickCount?: number, // total click count
    conversionCount?: number, // conversion count,
    isSubmitting?: boolean, // only used in frontend
}

export enum ConversionCountUpdateType {
    INC = 'INC',
    DEC = 'DEC',
}