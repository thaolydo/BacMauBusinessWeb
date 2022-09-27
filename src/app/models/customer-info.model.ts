export interface CustomerInfo {
    name: string;
    phone: string;
    birthMonth: string;
    birthDay: string;
    birthday?: Date; // This is only available for response from backend
}
