export interface CustomerInfo {
    name: string,
    phone: string,
    latestOptStatus: OptStatus,
    birthMonth: number,
    birthDay: number,
    cid?: string, // This is only for send request to backend
    birthday?: Date, // This is only available for response from backend
    notes?: string,
    isSubmitting?: boolean, // this is only used by front-end
    editMode?: boolean, // this is only used by front-end
}

export enum OptStatus {
    PENDING = "PENDING",
    IN = "IN",
    OUT = "OUT",
}
