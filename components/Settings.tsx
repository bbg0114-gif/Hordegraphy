
import React, { useRef, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { FirebaseConfig } from '../types';
import { Download, Upload, AlertTriangle, ShieldCheck, Database, Lock, Copy, Check, Terminal, Globe, Cloud, Zap } from 'lucide-react';

interface SettingsProps {
  onDataImport: () => void;
  isAdmin: boolean;
  clubLink: string;
  onUpdateClubLink: (link: string) => void;
  onSetupFirebase: (config: FirebaseConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ onDataImport, isAdmin, clubLink, onUpdateClubLink, onSetupFirebase }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawText, setRawText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showManual, setShowManual] = useState(false);
  
  // Firebase Form
  const [fbConfigText, setFbConfigText] = useState('');

  useEffect(() => {
    const existing = storageService.getFirebaseConfig();
    if (existing) {
      setFbConfigText(JSON.stringify(existing, null, 2));
    }
  }, []);

  const handleExport = () => {
    storageService.exportAllData();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (storageService.importAllData(content)) {
          alert('데이터 복원이 완료되었습니다!');
          onDataImport();
        } else {
          alert('잘못된 백업 파일입니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyRaw = () => {
    const data = {
      members: storageService.getMembers(),
      bannedMembers: storageService.getBannedMembers(),
      attendance: storageService.getAttendance(),
      metadata: storageService.getMetadata(),
      onlineAttendance: storageService.getOnlineAttendance(),
      onlineMetadata: storageService.getOnlineMetadata(),
      globalSessions: storageService.getGlobalSessionNames(),
      clubLink: storageService.getClubLink()
    };
    navigator.clipboard.writeText(JSON.stringify(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleManualImport = () => {
    if (!isAdmin) return;
    if (!rawText.trim()) return alert('데이터 텍스트를 입력해주세요.');
    
    if (window.confirm('입력한 텍스트로 데이터를 덮어씌울까요?')) {
      if (storageService.importAllData(rawText)) {
        alert('데이터 복원이 완료되었습니다!');
        setRawText('');
        setShowManual(false);
        onDataImport();
      } else {
        alert('잘못된 데이터 형식입니다.');
      }
    }
  };

  const handleSaveFirebase = () => {
    try {
      const config = JSON.parse(fbConfigText) as FirebaseConfig;
      if (config.apiKey && config.databaseURL) {
        onSetupFirebase(config);
        alert('Firebase 실시간 연동이 설정되었습니다.');
      } else {
        alert('올바른 Firebase 설정 형식이 아닙니다.');
      }
    } catch (e) {
      alert('JSON 형식이 올바르지 않습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Cloud Sync Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 lg:p-10 text-white shadow-xl relative overflow-hidden group">
        <Cloud className="absolute right-[-20px] top-[-20px] w-64 h-64 opacity-10 group-hover:scale-110 transition-transform" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><Zap className="w-8 h-8 text-yellow-300" /></div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">실시간 클라우드 연동 (Firebase)</h3>
              <p className="text-indigo-100 text-sm font-medium">여러 기기에서 동시에 출석 체크를 관리하고 실시간으로 공유하세요.</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-indigo-200">Firebase Config JSON</label>
              <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[10px] font-bold underline hover:text-white">콘솔 바로가기</a>
            </div>
            <textarea
              value={fbConfigText}
              onChange={(e) => setFbConfigText(e.target.value)}
              placeholder='{ "apiKey": "...", "databaseURL": "...", ... }'
              className="w-full h-32 bg-slate-900/50 border border-white/20 rounded-xl p-4 text-[10px] font-mono outline-none focus:ring-2 focus:ring-blue-400"
            />
            {isAdmin && (
              <button 
                onClick={handleSaveFirebase}
                className="w-full py-3.5 bg-white text-indigo-700 rounded-xl font-black hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
              >
                클라우드 연동 활성화
              </button>
            )}
          </div>
          <p className="text-[10px] text-indigo-200 leading-relaxed">
            * Firebase 콘솔에서 Realtime Database를 생성한 후, '프로젝트 설정'의 앱 구성 정보(JSON)를 복사해서 붙여넣으세요.
            데이터베이스 규칙(Rules)이 `.read: true`, `.write: true`로 설정되어 있어야 합니다.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Database className="w-7 h-7 text-blue-600" />
            데이터 관리 및 백업
          </h3>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            이 앱은 기본적으로 브라우저에 데이터를 저장합니다. 클라우드 연동을 사용하지 않는 경우 <span className="underline">배포 전에는 반드시 백업</span>을 하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 space-y-4">
            <h4 className="font-bold text-blue-800 flex items-center gap-2">
              <Download className="w-5 h-5" />
              파일로 백업하기
            </h4>
            <p className="text-xs text-blue-600 leading-relaxed font-medium">
              모든 기록을 .json 파일로 저장합니다. PC 보관용으로 가장 안전합니다.
            </p>
            <button
              onClick={handleExport}
              className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              백업 파일 다운로드
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 relative overflow-hidden">
            {!isAdmin && (
              <div className="absolute inset-0 bg-slate-100/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Lock className="w-8 h-8 opacity-20" />
                <p className="font-bold text-xs">관리자 전용</p>
              </div>
            )}
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              파일로 복원하기
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              다운로드했던 백업 파일을 선택하여 모든 데이터를 복구합니다.
            </p>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" ref={fileInputRef} />
            <button
              disabled={!isAdmin}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-white text-slate-700 border border-slate-300 rounded-2xl font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              파일 선택하여 복원
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-500" />
            모임 공식 링크 설정
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={clubLink}
              onChange={(e) => onUpdateClubLink(e.target.value)}
              disabled={!isAdmin}
              placeholder="https://cafe.naver.com/..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:opacity-50"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-400" />
              간편 텍스트 백업/복원
            </h4>
            <button 
              onClick={() => setShowManual(!showManual)}
              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl"
            >
              {showManual ? '닫기' : '텍스트로 관리하기'}
            </button>
          </div>
          
          {showManual && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex gap-2">
                <button
                  onClick={handleCopyRaw}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? '복사되었습니다' : '현재 데이터 텍스트로 복사'}
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="여기에 백업했던 텍스트 코드를 붙여넣으세요..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                {isAdmin && (
                  <button
                    onClick={handleManualImport}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg"
                  >
                    텍스트로 복원하기
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="text-sm text-amber-700 space-y-2">
            <h5 className="font-bold">데이터 손실 주의</h5>
            <p className="text-xs font-medium leading-relaxed">
              클라우드 연동 시, 로컬 데이터보다 클라우드 데이터가 우선됩니다. 
              최초 연동 시 '파일로 백업'을 먼저 수행하여 데이터를 안전하게 보호하세요.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold">보안 정책상 데이터베이스 규칙을 적절히 설정하는 것이 중요합니다.</span>
        </div>
      </div>
    </div>
  );
};

export default Settings;
