import { Member, AttendanceRecord, MetadataRecord, BannedMember, Suggestion, FirebaseConfig } from '../types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

// -----------------------------------------------------------
// 1. 아래 내용을 본인의 Firebase 설정값으로 바꿔주세요!
// (Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 에서 확인 가능)
// -----------------------------------------------------------
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBnp6vXjDZkRdVpGIaqec6g5qT9eTIRKbc",
  authDomain: "hordegraphy.firebaseapp.com",
  databaseURL: "https://hordegraphy-default-rtdb.firebaseio.com",
  projectId: "hordegraphy",
  storageBucket: "hordegraphy.firebasestorage.app",
  messagingSenderId: "794886093992",
  appId: "1:794886093992:web:32a2f50774d8103a78569d",
  measurementId: "G-HZ5CJ1LDE7"
};

// 2. 앱 실행 시 무조건 Firebase에 연결합니다.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

const MEMBERS_KEY = 'club_members_v1';
const BANNED_KEY = 'club_banned_v1';
const ATTENDANCE_KEY = 'club_attendance_v1';
const METADATA_KEY = 'club_daily_metadata_v1';
const ONLINE_ATTENDANCE_KEY = 'club_online_attendance_v1';
const ONLINE_METADATA_KEY = 'club_online_metadata_v1';
const GLOBAL_SESSIONS_KEY = 'club_global_sessions_v1';
const CLUB_LINK_KEY = 'club_link_v1';
const SUGGESTIONS_KEY = 'club_suggestions_v1';

export const DEFAULT_SESSIONS = ['모임 1회', '모임 2회', '모임 3회', '모임 4회'];

export const storageService = {
  // 초기화 함수 (이제 설정이 코드에 있으므로 단순히 true 반환)
  initFirebase: (config?: FirebaseConfig) => {
    return true; 
  },

  getFirebaseConfig: (): FirebaseConfig | null => {
    return firebaseConfig;
  },

  isCloudEnabled: () => true, // 항상 연결됨

  // 실시간 업데이트 구독 (데이터가 변경되면 알림)
  subscribe: (callback: (data: any) => void) => {
    const dbRef = ref(database, '/');
    return onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 데이터가 들어오면 로컬 스토리지도 최신화하여 싱크를 맞춤
        if (data.members) localStorage.setItem(MEMBERS_KEY, JSON.stringify(data.members));
        if (data.attendance) localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data.attendance));
        // ... 필요한 경우 다른 데이터도 여기서 동기화 가능
        callback(data);
      }
    });
  },

  // 클라우드 강제 저장
  saveToCloud: async (data: any) => {
    await set(ref(database, '/'), data);
  },

  // --- 멤버 관리 ---
  getMembers: (): Member[] => {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMembers: (members: Member[]) => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    set(ref(database, 'members'), members); // 항상 DB에 저장
  },

  // --- 차단 멤버 관리 ---
  getBannedMembers: (): BannedMember[] => {
    const data = localStorage.getItem(BANNED_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveBannedMembers: (members: BannedMember[]) => {
    localStorage.setItem(BANNED_KEY, JSON.stringify(members));
    set(ref(database, 'bannedMembers'), members);
  },

  // --- 출석 기록 ---
  getAttendance: (): AttendanceRecord => {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : {};
  },
  saveAttendance: (attendance: AttendanceRecord) => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
    set(ref(database, 'attendance'), attendance);
  },

  // --- 온라인 출석 ---
  getOnlineAttendance: (): AttendanceRecord => {
    const data = localStorage.getItem(ONLINE_ATTENDANCE_KEY);
    return data ? JSON.parse(data) : {};
  },
  saveOnlineAttendance: (attendance: AttendanceRecord) => {
    localStorage.setItem(ONLINE_ATTENDANCE_KEY, JSON.stringify(attendance));
    set(ref(database, 'onlineAttendance'), attendance);
  },

  // --- 메타데이터 ---
  getMetadata: (): MetadataRecord => {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : {};
  },
  saveMetadata: (metadata: MetadataRecord) => {
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
    set(ref(database, 'metadata'), metadata);
  },

  // --- 온라인 메타데이터 ---
  getOnlineMetadata: (): MetadataRecord => {
    const data = localStorage.getItem(ONLINE_METADATA_KEY);
    return data ? JSON.parse(data) : {};
  },
  saveOnlineMetadata: (metadata: MetadataRecord) => {
    localStorage.setItem(ONLINE_METADATA_KEY, JSON.stringify(metadata));
    set(ref(database, 'onlineMetadata'), metadata);
  },

  // --- 세션 이름 ---
  getGlobalSessionNames: (): string[] => {
    const data = localStorage.getItem(GLOBAL_SESSIONS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SESSIONS;
  },
  saveGlobalSessionNames: (names: string[]) => {
    localStorage.setItem(GLOBAL_SESSIONS_KEY, JSON.stringify(names));
    set(ref(database, 'globalSessionNames'), names);
  },

  // --- 클럽 링크 ---
  getClubLink: (): string => {
    return localStorage.getItem(CLUB_LINK_KEY) || '';
  },
  saveClubLink: (link: string) => {
    localStorage.setItem(CLUB_LINK_KEY, link);
    set(ref(database, 'clubLink'), link);
  },

  // --- 건의함 ---
  getSuggestions: (): Suggestion[] => {
    const data = localStorage.getItem(SUGGESTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSuggestions: (suggestions: Suggestion[]) => {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
    set(ref(database, 'suggestions'), suggestions);
  },
  
  // 데이터 내보내기 (백업용)
  exportAllData: () => {
    const data = {
      members: storageService.getMembers(),
      bannedMembers: storageService.getBannedMembers(),
      attendance: storageService.getAttendance(),
      metadata: storageService.getMetadata(),
      onlineAttendance: storageService.getOnlineAttendance(),
      onlineMetadata: storageService.getOnlineMetadata(),
      globalSessions: storageService.getGlobalSessionNames(),
      clubLink: storageService.getClubLink(),
      suggestions: storageService.getSuggestions(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `club_attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // 데이터 불러오기
  importAllData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      // 로컬 스토리지 업데이트
      if (data.members) localStorage.setItem(MEMBERS_KEY, JSON.stringify(data.members));
      if (data.attendance) localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data.attendance));
      // ... (필요 시 다른 항목도 추가)

      // 클라우드에 전체 업로드
      storageService.saveToCloud(data);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  clearMonthData: (year: number, month: number, attendance: AttendanceRecord): AttendanceRecord => {
    const newRecord = { ...attendance };
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    Object.keys(newRecord).forEach(date => {
      if (date.startsWith(monthStr)) {
        delete newRecord[date];
      }
    });
    return newRecord;
  }
};