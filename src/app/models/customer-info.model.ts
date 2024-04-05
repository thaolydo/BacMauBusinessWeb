export interface CustomerInfo {
    name: string;
    phone: string;
    latestOptStatus: OptStatus;
    birthMonth: string;
    birthDay: string;
    cid?: string; // This is only for send request to backend
    birthday?: Date; // This is only available for response from backend
}

export enum OptStatus {
    PENDING = "PENDING",
    IN = "IN",
    OUT = "OUT"
}
