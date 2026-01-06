
import React, { useState } from 'react';
import { BannedMember } from '../types';
import { ShieldAlert, UserX, Trash2, Calendar, Search, AlertCircle, Lock, UserPlus } from 'lucide-react';

interface BlacklistManagerProps {
  bannedMembers: BannedMember[];
  onAdd: (name: string, reason: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const BlacklistManager: React.FC<BlacklistManagerProps> = ({ 
  bannedMembers, 
  onAdd, 
  onDelete, 
  isAdmin 
}) => {
  const [newName, setNewName] = useState('');
  const [newReason, setNewReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin && newName.trim() && newReason.trim()) {
      onAdd(newName.trim(), newReason.trim());
      setNewName('');
      newReason.trim();
      setNewReason('');
    }
  };

  const filteredBanned = bannedMembers.filter(bm => 
    bm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bm.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <ShieldAlert className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 rotate-12" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <UserX className="w-8 h-8 text-red-500" />
            블랙리스트 관리
          </h2>
          <p className="mt-2 text-slate-400 max-w-xl">
            동호회 규칙을 위반하거나 강퇴된 회원을 관리합니다. 
            여기에 등록된 닉네임은 다시 가입(추가)할 수 없습니다.
          </p>
        </div>
      </div>

      {/* Input Form */}
      {isAdmin ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-red-600" />
            강퇴 회원 등록
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">닉네임</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="대상 닉네임"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">강퇴 사유</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="사유를 상세히 입력하세요"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!newName.trim() || !newReason.trim()}
              className="w-full py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md shadow-red-100"
            >
              블랙리스트 추가
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200 text-center text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          블랙리스트 편집은 관리자만 가능합니다.
        </div>
      )}

      {/* Search & List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-800">명단 ({bannedMembers.length})</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">DANGER ZONE</span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 또는 사유 검색..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-slate-400 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {filteredBanned.length > 0 ? (
            filteredBanned.map((member) => (
              <div key={member.id} className="p-6 flex items-start justify-between hover:bg-red-50/30 transition-all group">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                    <UserX className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{member.name}</h4>
                      <span className="text-[10px] text-red-500 font-bold border border-red-200 px-1.5 rounded uppercase">Banned</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      <span className="text-slate-400 font-bold mr-2">사유:</span>
                      {member.reason}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>강퇴일: {member.bannedAt}</span>
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <button 
                    onClick={() => { if(window.confirm('블랙리스트에서 제외하시겠습니까?')) onDelete(member.id); }}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    title="사면"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-slate-200" />
              <p className="text-slate-400 font-medium">블랙리스트가 비어있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlacklistManager;
