// Copied from backend
export interface CheckInRequest {
    bid: string,
    phone: string,
    name: string,
    updateInfo?: boolean,
    newCustomer?: boolean,
    birthDay?: number,
    birthMonth?: number,
}
