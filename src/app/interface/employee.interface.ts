import { AccessLog } from "./access-log.interface";
export interface Employee {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  role: string;
  regdate: Date;
  lastlogdate: string; 
  profileImage?: string;
  rfidtag?: string;
  selected?: boolean;
  accessLogs?: AccessLog[]; // Add accessLogs property
  fingerprint1?: string;
  fingerprint2?: string;
  branch: string;
  deldate?: Date;
}
