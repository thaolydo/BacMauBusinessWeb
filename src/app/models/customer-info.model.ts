export interface CustomerInfo {
    name: string;
    phone: string;
    birthMonth: string;
    birthDay: string;
    cid?: string; // This is only for send request to backend
    birthday?: Date; // This is only available for response from backend
}
