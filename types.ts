
export interface Member {
  id: string;
  name: string;
  joinedAt: string;
  isStaff?: boolean;
  isLeader?: boolean;
  previousNames?: string[];
}

export interface BannedMember {
  id: string;
  name: string;
  reason: string;
  bannedAt: string;
}

export interface Suggestion {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export type AttendanceStatus = 0 | 1 | 2;
export type SessionAttendance = [AttendanceStatus, AttendanceStatus, AttendanceStatus, AttendanceStatus];

export interface DailyAttendance {
  [memberId: string]: SessionAttendance;
}

export interface AttendanceRecord {
  [date: string]: DailyAttendance;
}

export interface DailyMetadata {
  sessionNames?: string[];
  sessionHosts?: string[];
  sessionCount?: number;
}

export interface MetadataRecord {
  [date: string]: DailyMetadata;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE = 'ATTENDANCE',
  ONLINE_ATTENDANCE = 'ONLINE_ATTENDANCE',
  MEMBERS = 'MEMBERS',
  SUGGESTIONS = 'SUGGESTIONS',
  AI_REPORT = 'AI_REPORT',
  SETTINGS = 'SETTINGS',
  BLACKLIST = 'BLACKLIST'
}
