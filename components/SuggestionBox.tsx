
import React, { useState } from 'react';
import { Suggestion } from '../types';
import { MessageSquareQuote, Send, User, Trash2, Clock, Sparkles } from 'lucide-react';

interface SuggestionBoxProps {
  suggestions: Suggestion[];
  onAdd: (content: string, author: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ suggestions, onAdd, onDelete, isAdmin }) => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(content.trim(), author.trim());
      setContent('');
      setAuthor('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white rounded-[40px] p-8 lg:p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
              <MessageSquareQuote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">호드 건의함</h2>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-0.5">Community Voices</p>
            </div>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
            모임에 대한 건의사항이나 운영진에게 하고 싶은 말, 또는 멤버들에게 남기고 싶은 따뜻한 한마디를 자유롭게 적어주세요! (익명 가능)
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="어떤 이야기를 남기고 싶으신가요? (비방이나 욕설은 삼가해주세요)"
                className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all font-medium text-slate-700 resize-none"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="닉네임 (미입력 시 익명)"
                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              남기기
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            최근 메시지
          </h3>
          <span className="text-[10px] font-bold text-slate-400">{suggestions.length} 개의 이야기</span>
        </div>

        {suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 font-black text-sm">
                      {s.author[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm leading-none">{s.author}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.createdAt}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => { if(window.confirm('이 메시지를 삭제할까요?')) onDelete(s.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm italic">
                  "{s.content}"
                </p>
                <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageSquareQuote className="w-10 h-10 text-slate-50 rotate-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center gap-4 bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <MessageSquareQuote className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-lg uppercase tracking-tight">아직 도착한 메시지가 없어요</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionBox;
