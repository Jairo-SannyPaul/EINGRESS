export interface User {
    id: number;
    username?: string;  
    password?:string;
    role?: string;
    email: string;
    verified: boolean;
    reset_token: string;
    token_expiry: Date;
    otp_code?: string; 
    otp_expiry?: Date;
    profileImage?: string;
  }