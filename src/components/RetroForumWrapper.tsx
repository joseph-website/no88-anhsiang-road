import React from 'react';
import {
  Megaphone
} from 'lucide-react';
import { UIStyleMode } from '../types';
import { sound } from '../services/soundEngine';

interface RetroForumWrapperProps {
  uiStyleMode: UIStyleMode;
  onToggleUiStyleMode: () => void;
  playerName: string;
  boardName?: string;
  articleTitle?: string;
  investigationDay: number;
  investigationDateText: string;
  currentLocationName: string;
  completedWeek1?: boolean;
  children: React.ReactNode;
}

export const RetroForumWrapper: React.FC<RetroForumWrapperProps> = ({
  uiStyleMode,
  onToggleUiStyleMode,
  playerName,
  boardName = '怪談',
  articleTitle = '那棟大樓',
  investigationDay,
  investigationDateText,
  currentLocationName,
  completedWeek1 = false,
  children
}) => {
  if (uiStyleMode === 'modern') {
    return <>{children}</>;
  }

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-[#eef3ec] text-[#222222] font-serif">
      {/* 2000s Classic Taiwanese Web Portal / Yahoo Club Container */}
      <div className="w-full max-w-[1550px] mx-auto flex-1 min-h-0 flex flex-col px-1 sm:px-2 py-1 overflow-hidden">
        
        {/* Family Announcement / Portal Notice Board */}
        <div className="bg-[#ffffff] border border-[#a8c2a1] p-2 sm:px-3 sm:py-1.5 mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[13px] shadow-2xs shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 bg-[#4a723e] text-[#ffffff] font-bold text-xs shrink-0 rounded-xs flex items-center gap-1">
              <Megaphone className="w-3.5 h-3.5" />
              <span>【怪談】公告</span>
            </span>
            <p className="text-[#333333] truncate leading-tight">
              【置頂】熱門連載串《{articleTitle || '那棟大樓'}》，請板友理性討論，切勿前往現場探險打擾住戶。
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#555555] shrink-0 ml-auto font-sans">
            <span className="hidden md:inline">使用者：{playerName || '尚未註冊'}</span>
            <span className="hidden md:inline text-[#cccccc]">|</span>
            <span className="text-[#2e6d24] font-bold">● 調查中（在線）</span>
          </div>
        </div>

        {/* Retro Main Frame Area */}
        <div className="flex-1 min-h-0 flex flex-col bg-[#ffffff] border border-[#9bb793] shadow-xs overflow-hidden relative">
          {children}
        </div>

        {/* 2000s Web Portal Footer (Classic Taiwan Forum / Kimo Family signature footer) */}
        <div className="bg-[#e8f0e5] border border-[#a8c2a1] border-t-0 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#555555] shrink-0">
          <div className="flex items-center gap-2">
            <span>© 2004-2012 【怪談】正在閱讀：那棟大樓（mawei） | 伺服器狀態：正常</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline">最佳瀏覽解析度：1024×768 (全彩)</span>
            <span className="hidden sm:inline text-[#cccccc]">|</span>
            <button
              onClick={() => {
                sound.playClick();
                onToggleUiStyleMode();
              }}
              className="text-[#0033cc] hover:text-[#cc0000] underline cursor-pointer font-bold"
            >
              [切換為現代簡約介面]
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

