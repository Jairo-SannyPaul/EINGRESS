import { AccessLog } from "./access-log.interface";
export interface Employee {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  role: string;
  regdate?: Date;
  lastlogdate?: string; // Make lastlogdate optional to align with the backend
  profileImage?: string;
  rfidtag?: string;
  selected?: boolean;
  accessLogs?: AccessLog[]; // Add accessLogs property
  fingerprint1?: string;
  fingerprint2?: string;
  branch: string;
}
