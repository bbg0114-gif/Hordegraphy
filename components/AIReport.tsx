
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Member, AttendanceRecord } from '../types';
import { Sparkles, BrainCircuit, RefreshCw, Copy, Check } from 'lucide-react';

interface AIReportProps {
  members: Member[];
  attendance: AttendanceRecord;
}

const AIReport: React.FC<AIReportProps> = ({ members, attendance }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setCopied(false);
    try {
      // Fix: Strictly follow GoogleGenAI initialization guideline
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const dataSummary = members.map(m => {
        let count = 0;
        Object.values(attendance).forEach(day => {
          if (day[m.id]) count += day[m.id].filter(Boolean).length;
        });
        return `${m.name}: ${count}회`;
      }).join(', ');

      const prompt = `
        동호회 회원들의 출석 데이터 분석 리포트 요청:
        데이터: ${dataSummary}

        분석 내용:
        1. 가장 참여도가 높은 회원들(Top 3) 칭찬
        2. 동호회 활성화 점수 (100점 만점)와 이유
        3. 전체적인 모임 분위기 평가
        4. 참여가 저조한 회원들을 위한 재치 있는 응원 문구

        마크다운 형식을 사용하여 친절하고 전문적으로 작성해줘.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setReport(response.text || '리포트를 생성하지 못했습니다.');
    } catch (error) {
      console.error(error);
      setReport('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-blue-200" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">AI Analysis Report</h2>
          </div>
          <button
            onClick={generateReport}
            disabled={loading || members.length === 0}
            className="px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 active:scale-95"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            분석 리포트 생성
          </button>
        </div>
        <p className="text-blue-100 max-w-2xl leading-relaxed">
          동호회원들의 출석 패턴을 AI가 정밀 분석하여 리포트를 제공합니다. 
          리포트를 복사하여 회원들과 공유해보세요!
        </p>
      </div>

      {report && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
          <button
            onClick={copyToClipboard}
            className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 flex items-center gap-2 font-bold text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사됨' : '전체 복사'}
          </button>
          <div className="prose prose-blue max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
              {report}
            </div>
          </div>
        </div>
      )}

      {!report && !loading && (
        <div className="py-32 text-center text-slate-300 border-4 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-4">
          <BrainCircuit className="w-16 h-16 opacity-10" />
          <p className="text-lg font-bold">분석 버튼을 누르면 리포트가 여기에 표시됩니다.</p>
        </div>
      )}

      {loading && (
        <div className="py-32 text-center">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <Sparkles className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-slate-600 font-bold text-lg">AI가 데이터를 심층 분석 중입니다...</p>
        </div>
      )}
    </div>
  );
};

export default AIReport;
