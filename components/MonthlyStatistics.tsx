
import React, { useMemo, useState } from 'react';
import { Member, AttendanceRecord, MetadataRecord } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Globe, MapPin, Users, HelpCircle, Info } from 'lucide-react';

interface MonthlyStatisticsProps {
  members: Member[];
  attendance: AttendanceRecord;
  metadata: MetadataRecord;
  onlineAttendance: AttendanceRecord;
  onlineMetadata: MetadataRecord;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
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

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 참여 데이터 상세 가공 (어떤 세션에 참여했는지 인덱스 저장)
  const gridData = useMemo(() => {
    return members.map(member => {
      const dailyStats: Record<number, { off: number[]; on: number[] }> = {};
      let totalOff = 0;
      let totalOn = 0;

      days.forEach(day => {
        const dateKey = `${monthStr}-${String(day).padStart(2, '0')}`;
        
        // 오프라인 세션 인덱스 추출
        const offRec = attendance[dateKey]?.[member.id] || [0, 0, 0, 0];
        const offIndices: number[] = [];
        offRec.forEach((status, idx) => { if (status === 1) offIndices.push(idx); });
        
        // 온라인 세션 인덱스 추출
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
    }).sort((a, b) => b.totalOff - a.totalOff || b.totalOn - a.totalOn);
  }, [members, attendance, metadata, onlineAttendance, onlineMetadata, monthStr, days]);

  // 툴팁에 표시할 동시 참여자 찾기 함수
  const getFellowAttendees = (dateKey: string, type: 'off' | 'on', sessionIdx: number, currentMemberId: string) => {
    const targetRecord = type === 'off' ? attendance[dateKey] : onlineAttendance[dateKey];
    if (!targetRecord) return [];
    
    return members
      .filter(m => m.id !== currentMemberId && targetRecord[m.id]?.[sessionIdx] === 1)
      .map(m => m.name);
  };

  return (
    <div className="max-w-full mx-auto space-y-6 pb-20 overflow-hidden flex flex-col h-full">
      {/* Header Selector */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-8">
          <button onClick={handlePrevMonth} className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm"><ChevronLeft className="w-6 h-6 text-slate-400" /></button>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">{year} YEAR</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{month + 1}<span className="text-xl text-slate-300 ml-1 font-bold">월</span></h2>
          </div>
          <button onClick={handleNextMonth} className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm"><ChevronRight className="w-6 h-6 text-slate-400" /></button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-[10px] font-black text-slate-500 uppercase">오프라인</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-indigo-400 rounded-full" />
            <span className="text-[10px] font-black text-slate-500 uppercase">온라인</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-amber-600 uppercase">동시 참여자 강조</span>
          </div>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 h-full">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="sticky left-0 z-30 bg-slate-50 p-4 text-left font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 min-w-[120px]">회원명</th>
                {days.map(day => {
                  const date = new Date(year, month, day);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th key={day} className={`p-2 min-w-[42px] text-center border-r border-slate-100 ${isWeekend ? 'bg-slate-100/50' : ''}`}>
                      <div className={`font-black ${date.getDay() === 0 ? 'text-red-400' : date.getDay() === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{day}</div>
                      <div className="text-[8px] font-bold text-slate-300 uppercase">{['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}</div>
                    </th>
                  );
                })}
                <th className="p-4 text-center font-black text-slate-400 uppercase tracking-widest min-w-[80px]">총합</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gridData.map((data) => (
                <tr key={data.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-3 font-black text-slate-700 border-r border-slate-200 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] text-white ${data.isStaff ? 'bg-indigo-500' : data.isLeader ? 'bg-amber-500' : 'bg-slate-300'}`}>{data.name[0]}</div>
                    <span className="truncate">{data.name}</span>
                  </td>
                  {days.map(day => {
                    const stats = data.dailyStats[day];
                    const dateKey = `${monthStr}-${String(day).padStart(2, '0')}`;
                    
                    return (
                      <td key={day} className="p-1 border-r border-slate-50 text-center relative group/cell">
                        <div className="grid grid-cols-2 gap-0.5 w-full h-full place-items-center">
                          {/* Offline Dots */}
                          {stats.off.map(idx => {
                            const isHighlighted = hovered?.dateKey === dateKey && hovered?.type === 'off' && hovered?.sessionIdx === idx;
                            const sessionName = metadata[dateKey]?.sessionNames?.[idx] || `모임 ${idx + 1}`;
                            const sessionHost = metadata[dateKey]?.sessionHosts?.[idx] || '미정';
                            const fellows = getFellowAttendees(dateKey, 'off', idx, data.id);
                            const tooltip = `${sessionName} (벙주: ${sessionHost})\n함께한 사람: ${fellows.length > 0 ? fellows.join(', ') : '없음'}`;

                            return (
                              <div 
                                key={`off-${idx}`}
                                onMouseEnter={() => setHovered({ dateKey, type: 'off', sessionIdx: idx })}
                                onMouseLeave={() => setHovered(null)}
                                title={tooltip}
                                className={`w-3 h-3 rounded-full transition-all cursor-help shadow-sm ${
                                  isHighlighted 
                                    ? 'bg-amber-400 scale-150 z-10 ring-2 ring-white animate-pulse' 
                                    : 'bg-blue-500 hover:bg-blue-400'
                                }`}
                              />
                            );
                          })}
                          {/* Online Dots */}
                          {stats.on.map(idx => {
                            const isHighlighted = hovered?.dateKey === dateKey && hovered?.type === 'on' && hovered?.sessionIdx === idx;
                            const sessionName = onlineMetadata[dateKey]?.sessionNames?.[idx] || `온라인 ${idx + 1}`;
                            const sessionHost = onlineMetadata[dateKey]?.sessionHosts?.[idx] || '미정';
                            const fellows = getFellowAttendees(dateKey, 'on', idx, data.id);
                            const tooltip = `${sessionName} (벙주: ${sessionHost})\n함께한 사람: ${fellows.length > 0 ? fellows.join(', ') : '없음'}`;

                            return (
                              <div 
                                key={`on-${idx}`}
                                onMouseEnter={() => setHovered({ dateKey, type: 'on', sessionIdx: idx })}
                                onMouseLeave={() => setHovered(null)}
                                title={tooltip}
                                className={`w-3 h-3 rounded-full transition-all cursor-help shadow-sm ${
                                  isHighlighted 
                                    ? 'bg-amber-400 scale-150 z-10 ring-2 ring-white animate-pulse' 
                                    : 'bg-indigo-400 hover:bg-indigo-300'
                                }`}
                              />
                            );
                          })}
                          {stats.off.length === 0 && stats.on.length === 0 && (
                            <div className="col-span-2 w-1 h-1 bg-slate-100 rounded-full" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3 text-center bg-slate-50/30">
                    <div className="flex flex-col items-center leading-none">
                      <span className="text-slate-900 font-black">{data.totalOff + data.totalOn}</span>
                      <div className="flex gap-1 mt-1">
                        {data.totalOff > 0 && <span className="text-[7px] font-black text-blue-500 uppercase">O:{data.totalOff}</span>}
                        {data.totalOn > 0 && <span className="text-[7px] font-black text-indigo-400 uppercase">N:{data.totalOn}</span>}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Card */}
      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
        <div className="bg-blue-600 p-1.5 rounded-lg shrink-0 mt-0.5"><Info className="w-3.5 h-3.5 text-white" /></div>
        <div className="space-y-1">
          <p className="text-xs font-black text-blue-900 uppercase tracking-tight">지능형 참여 분석 시스템</p>
          <ul className="text-[10px] font-bold text-blue-700/80 list-disc list-inside space-y-0.5">
            <li>각 점(Dot)은 개별 모임(벙) 참여를 의미합니다.</li>
            <li>점 위에 마우스를 올리면 <strong>모임 이름, 벙주, 함께 참여한 동료</strong>를 확인할 수 있습니다.</li>
            <li>마우스를 올린 모임에 <strong>동시 참여한 모든 인원이 황금색으로 강조</strong>되어 커뮤니티 관계망을 쉽게 파악할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatistics;
