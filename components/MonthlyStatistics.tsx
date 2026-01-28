
import React, { useMemo, useState } from 'react';
import { Member, AttendanceRecord, MetadataRecord } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Globe, MapPin, Users, HelpCircle, Info, Search, X, Filter, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { matchSearch } from '../utils/chosung';

interface MonthlyStatisticsProps {
  members: Member[];
  attendance: AttendanceRecord;
  metadata: MetadataRecord;
  onlineAttendance: AttendanceRecord;
  onlineMetadata: MetadataRecord;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
}

interface SelectedSession {
  dateKey: string;
  type: 'off' | 'on';
  sessionIdx: number;
}

interface HoverState {
  dateKey: string;
  type: 'off' | 'on';
  sessionIdx: number;
}

const MonthlyStatistics: React.FC<MonthlyStatisticsProps> = ({
  members,
  attendance,
  metadata,
  onlineAttendance,
  onlineMetadata,
  selectedMonth,
  setSelectedMonth,
}) => {
  const [hovered, setHovered] = useState<HoverState | null>(null);
  const [selectedSession, setSelectedSession] = useState<SelectedSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'desc'>('none');

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
    setSelectedSession(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
    setSelectedSession(null);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 1. 회원 기본 정렬 (Leader > Staff > Name)
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.isLeader && !b.isLeader) return -1;
      if (!a.isLeader && b.isLeader) return 1;
      if (a.isStaff && !b.isStaff) return -1;
      if (!a.isStaff && b.isStaff) return 1;
      return a.name.localeCompare(b.name, 'ko');
    });
  }, [members]);

  // 2. 전체 데이터 가공
  const gridData = useMemo(() => {
    return sortedMembers.map(member => {
      const dailyStats: Record<number, { off: number[]; on: number[] }> = {};
      let totalOff = 0;
      let totalOn = 0;

      days.forEach(day => {
        const dateKey = `${monthStr}-${String(day).padStart(2, '0')}`;
        
        const offRec = attendance[dateKey]?.[member.id] || [0, 0, 0, 0];
        const offIndices: number[] = [];
        offRec.forEach((status, idx) => { if (status === 1) offIndices.push(idx); });
        
        const onRec = onlineAttendance[dateKey]?.[member.id] || [0, 0, 0, 0];
        const onIndices: number[] = [];
        onRec.forEach((status, idx) => { if (status === 1) onIndices.push(idx); });

        dailyStats[day] = { off: offIndices, on: onIndices };
        totalOff += offIndices.length;
        totalOn += onIndices.length;
      });

      return {
        ...member,
        dailyStats,
        totalOff,
        totalOn
      };
    });
  }, [sortedMembers, attendance, metadata, onlineAttendance, onlineMetadata, monthStr, days]);

  // 3. 필터링 및 정렬 (검색 + 세션 클릭 + TOTAL 정렬)
  const filteredData = useMemo(() => {
    let data = [...gridData];

    // 이름 검색 필터
    if (searchTerm) {
      data = data.filter(m => matchSearch(m.name, searchTerm));
    }

    // 세션 클릭 필터
    if (selectedSession) {
      const { dateKey, type, sessionIdx } = selectedSession;
      const day = parseInt(dateKey.split('-').pop() || '0');
      data = data.filter(m => {
        const stats = m.dailyStats[day];
        const list = type === 'off' ? stats.off : stats.on;
        return list.includes(sessionIdx);
      });
    }

    // TOTAL 정렬 적용 (참여 높은 순)
    if (sortOrder === 'desc') {
      data.sort((a, b) => (b.totalOff + b.totalOn) - (a.totalOff + a.totalOn));
    }

    return data;
  }, [gridData, searchTerm, selectedSession, sortOrder]);

  const handleDotClick = (dateKey: string, type: 'off' | 'on', sessionIdx: number) => {
    if (selectedSession?.dateKey === dateKey && 
        selectedSession?.type === type && 
        selectedSession?.sessionIdx === sessionIdx) {
      setSelectedSession(null); // 이미 선택된 걸 다시 누르면 해제
    } else {
      setSelectedSession({ dateKey, type, sessionIdx });
    }
  };

  const handleSortToggle = () => {
    // none -> desc (참여 높은 순) -> none (원상 복구)
    setSortOrder(prev => prev === 'none' ? 'desc' : 'none');
  };

  const getFellowAttendees = (dateKey: string, type: 'off' | 'on', sessionIdx: number, currentMemberId: string) => {
    const targetRecord = type === 'off' ? attendance[dateKey] : onlineAttendance[dateKey];
    if (!targetRecord) return [];
    
    return members
      .filter(m => m.id !== currentMemberId && targetRecord[m.id]?.[sessionIdx] === 1)
      .map(m => m.name);
  };

  const activeSessionInfo = useMemo(() => {
    if (!selectedSession) return null;
    const { dateKey, type, sessionIdx } = selectedSession;
    const meta = type === 'off' ? metadata : onlineMetadata;
    const name = meta[dateKey]?.sessionNames?.[sessionIdx] || (type === 'off' ? `모임 ${sessionIdx + 1}` : `온라인 ${sessionIdx + 1}`);
    const dateStrShort = dateKey.split('-').slice(1).join('/');
    return { name, dateStrShort, type };
  }, [selectedSession, metadata, onlineMetadata]);

  return (
    <div className="max-w-full mx-auto space-y-4 pb-20 overflow-hidden flex flex-col h-full">
      {/* Header Selector & Search */}
      <div className="bg-white p-4 lg:p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
            <div className="text-center min-w-[70px]">
              <p className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase mb-0.5">{year}</p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{month + 1}<span className="text-sm text-slate-300 ml-1">월</span></h2>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 shadow-sm"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 검색..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400" /></button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full" /><span className="text-[8px] font-black text-slate-500 uppercase">OFF</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-400 rounded-full" /><span className="text-[8px] font-black text-slate-500 uppercase">ON</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" /><span className="text-[8px] font-black text-amber-600 uppercase">ACTIVE</span></div>
        </div>
      </div>

      {/* Filter Info Bar */}
      {selectedSession && activeSessionInfo && (
        <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center justify-between animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-[10px] font-bold text-amber-900">
              <span className="opacity-60">{activeSessionInfo.dateStrShort}</span> 
              <span className="mx-1 font-black">"{activeSessionInfo.name}"</span> 
              참석자 필터링 중
            </p>
          </div>
          <button 
            onClick={() => setSelectedSession(null)}
            className="flex items-center gap-1 px-2 py-1 bg-white text-amber-700 text-[9px] font-black rounded-lg border border-amber-200 shadow-sm hover:bg-amber-100 transition-colors"
          >
            <X className="w-2.5 h-2.5" /> 해제
          </button>
        </div>
      )}

      {/* Heatmap Table */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 h-full">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="sticky left-0 z-30 bg-slate-50 p-2 text-left font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 min-w-[100px]">NAME</th>
                {days.map(day => {
                  const date = new Date(year, month, day);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th key={day} className={`p-1 min-w-[32px] text-center border-r border-slate-100 ${isWeekend ? 'bg-slate-100/50' : ''}`}>
                      <div className={`font-black ${date.getDay() === 0 ? 'text-red-400' : date.getDay() === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{day}</div>
                      <div className="text-[7px] font-bold text-slate-300 uppercase">{['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}</div>
                    </th>
                  );
                })}
                <th 
                  onClick={handleSortToggle}
                  className="p-2 text-center font-black text-slate-400 uppercase tracking-widest min-w-[70px] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    TOTAL
                    {sortOrder === 'none' ? <ArrowUpDown className="w-3 h-3 opacity-30" /> : <ChevronDown className="w-3 h-3 text-blue-600" />}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? filteredData.map((data) => (
                <tr key={data.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-1.5 font-black text-slate-700 border-r border-slate-200 flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] text-white ${data.isStaff ? 'bg-indigo-500' : data.isLeader ? 'bg-amber-500' : 'bg-slate-300'}`}>{data.name[0]}</div>
                    <span className="truncate max-w-[70px]">{data.name}</span>
                  </td>
                  {days.map(day => {
                    const stats = data.dailyStats[day];
                    const dateKey = `${monthStr}-${String(day).padStart(2, '0')}`;
                    
                    return (
                      <td key={day} className="p-0.5 border-r border-slate-50 text-center relative group/cell">
                        <div className="grid grid-cols-2 gap-[1px] w-full h-full place-items-center">
                          {/* Offline Dots */}
                          {stats.off.map(idx => {
                            const isHovered = hovered?.dateKey === dateKey && hovered?.type === 'off' && hovered?.sessionIdx === idx;
                            const isSelected = selectedSession?.dateKey === dateKey && selectedSession?.type === 'off' && selectedSession?.sessionIdx === idx;
                            
                            const sessionName = metadata[dateKey]?.sessionNames?.[idx] || `모임 ${idx + 1}`;
                            const sessionHost = metadata[dateKey]?.sessionHosts?.[idx] || '미정';
                            const fellows = getFellowAttendees(dateKey, 'off', idx, data.id);
                            const tooltip = `${sessionName} (벙주: ${sessionHost})\n함께한 사람: ${fellows.length > 0 ? fellows.join(', ') : '없음'}`;

                            return (
                              <div 
                                key={`off-${idx}`}
                                onMouseEnter={() => setHovered({ dateKey, type: 'off', sessionIdx: idx })}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => handleDotClick(dateKey, 'off', idx)}
                                title={tooltip}
                                className={`w-2 h-2 rounded-full transition-all cursor-pointer shadow-sm ${
                                  isHovered || isSelected
                                    ? 'bg-amber-400 scale-150 z-10 ring-1 ring-white animate-pulse' 
                                    : 'bg-blue-500 hover:bg-blue-400'
                                }`}
                              />
                            );
                          })}
                          {/* Online Dots */}
                          {stats.on.map(idx => {
                            const isHovered = hovered?.dateKey === dateKey && hovered?.type === 'on' && hovered?.sessionIdx === idx;
                            const isSelected = selectedSession?.dateKey === dateKey && selectedSession?.type === 'on' && selectedSession?.sessionIdx === idx;

                            const sessionName = onlineMetadata[dateKey]?.sessionNames?.[idx] || `온라인 ${idx + 1}`;
                            const sessionHost = onlineMetadata[dateKey]?.sessionHosts?.[idx] || '미정';
                            const fellows = getFellowAttendees(dateKey, 'on', idx, data.id);
                            const tooltip = `${sessionName} (벙주: ${sessionHost})\n함께한 사람: ${fellows.length > 0 ? fellows.join(', ') : '없음'}`;

                            return (
                              <div 
                                key={`on-${idx}`}
                                onMouseEnter={() => setHovered({ dateKey, type: 'on', sessionIdx: idx })}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => handleDotClick(dateKey, 'on', idx)}
                                title={tooltip}
                                className={`w-2 h-2 rounded-full transition-all cursor-pointer shadow-sm ${
                                  isHovered || isSelected
                                    ? 'bg-amber-400 scale-150 z-10 ring-1 ring-white animate-pulse' 
                                    : 'bg-indigo-400 hover:bg-indigo-300'
                                }`}
                              />
                            );
                          })}
                          {stats.off.length === 0 && stats.on.length === 0 && (
                            <div className="col-span-2 w-0.5 h-0.5 bg-slate-100 rounded-full" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-1.5 text-center bg-slate-50/30">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-slate-900 font-black">{data.totalOff + data.totalOn}</span>
                      <div className="flex gap-1 mt-0.5">
                        {data.totalOff > 0 && <span className="text-[6px] font-black text-blue-500">O:{data.totalOff}</span>}
                        {data.totalOn > 0 && <span className="text-[6px] font-black text-indigo-400">N:{data.totalOn}</span>}
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="bg-white"><td colSpan={daysInMonth + 2} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">결과 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mini Info Card */}
      <div className="bg-blue-50/40 p-3 rounded-2xl border border-blue-100 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-tight">Interaction Tip</p>
          <p className="text-[8px] font-bold text-blue-700/70 leading-relaxed">
            점(Dot)을 <strong>클릭</strong>하면 해당 모임 참석자만 필터링됩니다. <strong>TOTAL</strong> 헤더를 클릭하면 참여 높은 순으로 정렬됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatistics;
