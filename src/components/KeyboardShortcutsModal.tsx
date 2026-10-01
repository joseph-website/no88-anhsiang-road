import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Command
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasUnlockedEndings?: boolean;
}

interface ShortcutItem {
  keyLabel: string;
  description: string;
  category: 'core' | 'tools' | 'system';
}

const SHORTCUT_LIST: ShortcutItem[] = [
  { keyLabel: 'R', description: '【核心支柱一】開啟／收合奇怪的證物（第二輪為規則）', category: 'core' },
  { keyLabel: 'Tab / I', description: '【核心支柱二】開啟／收合隨身物證檔案袋', category: 'core' },
  { keyLabel: 'D', description: '【核心支柱三】開啟／收合案件思維推演與矛盾指證', category: 'core' },
  { keyLabel: 'ESC', description: '關閉當前所有開啟的手冊、物證袋或彈出對話視窗', category: 'core' },
  { keyLabel: 'J / L', description: '【輔助工具】開啟／收合現場調查活動日誌', category: 'tools' },
  { keyLabel: 'N', description: '【輔助工具】開啟／收合偵探速記便籤', category: 'tools' },
  { keyLabel: 'C', description: '【輔助工具】開啟／收合樓層結構勘驗羅盤', category: 'tools' },
  { keyLabel: 'G', description: '【系統功能】開啟結局成就與真相鑑賞室', category: 'system' },
  { keyLabel: 'S', description: '【系統功能】開啟檔案庫存檔與讀檔管理', category: 'system' },
  { keyLabel: 'M', description: '一鍵切換全域音效靜音 / 恢復', category: 'system' },
  { keyLabel: '?', description: '呼出此快捷鍵操作指引', category: 'system' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  hasUnlockedEndings = false
}) => {
  if (!isOpen) return null;

  const displayShortcuts = SHORTCUT_LIST.filter(item => {
    if (item.keyLabel === 'G' && !hasUnlockedEndings) {
      return false;
    }
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          className="retro-forum-modal-window max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-[#1a2e18] font-sans relative"
        >
          {/* Retro Title Bar */}
          <div className="retro-forum-modal-header flex items-center justify-between px-3 py-2 border-b-2 border-[#1c3819] select-none">
            <div className="flex items-center gap-2">
              <span className="text-[#a3e635] text-xs font-mono">⌨</span>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                偵探鍵盤快捷鍵指南 - [系統操作說明]
              </h3>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="text-[11px] font-mono font-bold text-[#fef08a] hover:text-white px-1.5 py-0.5 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer"
            >
              [關閉 X]
            </button>
          </div>

          <div className="p-3 sm:p-4 space-y-3.5 bg-[#f4f8f3]">
            {/* Sub-banner */}
            <div className="bg-[#e2ede0] border border-[#7ca078] p-2 text-xs flex items-center justify-between text-[#244222]">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#2e6827]" />
                <span>現場調查與檔案手冊快捷呼出表</span>
              </div>
              <span className="text-[10px] font-mono text-[#587854]">
                HOTKEYS // VER 2.0
              </span>
            </div>

            {/* List of shortcuts in retro table style */}
            <div className="border border-[#7ca078] bg-white max-h-[55vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#d5e5d3] border-b border-[#7ca078] text-[11px] font-bold text-[#1f3f1d]">
                    <th className="p-2 border-r border-[#7ca078]">功能說明 / 調查操作</th>
                    <th className="p-2 w-28 text-center">快捷按鍵</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0ece0]">
                  {displayShortcuts.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[#ebf5ea] transition-colors"
                    >
                      <td className="p-2 text-[#1e331c] leading-snug">
                        {item.description}
                      </td>
                      <td className="p-2 text-center align-middle">
                        <kbd className="inline-block px-2 py-0.5 bg-[#eef4ee] border-t border-l border-white border-r-2 border-b-2 border-[#52744e] text-[#1c3c1a] font-mono font-bold text-[11px] shadow-sm">
                          {item.keyLabel}
                        </kbd>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Retro tip box */}
            <div className="p-2.5 bg-[#fffde6] border border-[#d4be59] text-xs space-y-1 text-[#5c4a16]">
              <div className="font-bold flex items-center gap-1 text-[#6e4d05]">
                <Command className="w-3.5 h-3.5" />
                <span>★ 輸入防衝突保護機制：</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#68531d]">
                在您編輯偵探便箋、自訂調查日誌或鍵盤輸入文字時，全域快捷鍵會自動暫停響應，防止誤觸影響輸入。
              </p>
            </div>

            {/* Footer button */}
            <div className="pt-2 border-t border-[#adc7ab] flex justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="retro-web-btn px-4 py-1.5 text-xs font-bold"
              >
                確認並關閉 (ESC)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
