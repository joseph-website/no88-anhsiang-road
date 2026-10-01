import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Sparkles,
  Headphones,
  Terminal,
  X,
  Film,
  Mail
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface SecretArchiveModalProps {
  playerName?: string;
  onClose: () => void;
}

interface AudioTrack {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  date: string;
  transcript: string[];
  directorNote: string;
}

const CLASSIFIED_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'tape_01',
    title: '張浩獲救後第一階段精神評估錄音',
    speaker: '國立台大醫院 臨床心理科 吳主任 × 張浩',
    duration: '02:18',
    date: '2012年11月14日 09:30',
    transcript: [
      '「吳主任：張浩先生，請深呼吸……你現在在安全的醫院病房裡，陽光很好。」',
      '「張浩：（喉嚨沙啞，伴隨打字機幻聽微弱抽搐）……紙條……桌上的紙條……偵探他……他真的把那些規則撕下來了嗎？」',
      '「吳主任：是的，全案已經結案，工務局和警方已經封鎖了現場。那不是超自然黑洞，那是1998年違建與三十年的心理集體催眠。」',
      '「張浩：（長舒一口氣，傳來微弱抽泣與笑聲）……太好了……我終於聽不見四樓的敲門聲了……」'
    ],
    directorNote: '【編劇手記】張浩的聲音從初期的瀕臨崩潰到確認外界陽光時的釋然，是象徵 ED8 破曉救贖感的重要情感錨點。'
  },
  {
    id: 'tape_02',
    title: '1998年大樓建商林國祥警訊筆錄解密音檔',
    speaker: '市政府警察局 偵查隊員警 × 建商林國祥',
    duration: '01:45',
    date: '2002年04月18日 14:15',
    transcript: [
      '「警員：你承認為了一坪多賣二十萬，在四樓中央機電房外偷蓋了四間沒有產權的夾層套房？」',
      '「林國祥：大家都這樣幹！我哪知道後來會發生產權糾紛……那些租客天天吵，管委會乾脆把四樓電梯按鈕封死，當作四樓不存在……」',
      '「警員：你還手寫了那些禁止進出的告示？」',
      '「林國祥：那是為了嚇阻偷跑進去的遊民！誰知道傳著傳著……連警衛自己都當真了……」'
    ],
    directorNote: '【核心設定】怪異的本質始終是「人性的貪婪與逃避」。當官方和建商用謊言掩蓋違建，謊言經過三十年發酵，最終演變成了吃人的規則怪談。'
  },
  {
    id: 'tape_03',
    title: '警衛王大偉失蹤尋獲後的口供錄音',
    speaker: '轄區派出所員警 × 警衛王大偉',
    duration: '01:52',
    date: '2012年11月14日 11:20',
    transcript: [
      '「王大偉：……我不是故意要騙那位前來調查的偵探的……」',
      '「員警：那你為什麼每次有訪客來都給那張《警衛守則》？」',
      '「王大偉：上一任老警衛交接時就交代過……『只要大家都假裝沒有四樓，大樓就平安無事』。我守了十年，每天晚上聽著通風管的聲音，我也分不清到底是水管還是鬼怪了……」'
    ],
    directorNote: '【角色刻畫】王大偉並非惡人，他只是一個在體制與恐懼中被同化、不敢反抗的普通打工者。'
  }
];

export const SecretArchiveModal: React.FC<SecretArchiveModalProps> = ({ 
  playerName = '',
  onClose 
}) => {
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack>(CLASSIFIED_AUDIO_TRACKS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'letter' | 'audio' | 'blueprints' | 'notes'>('letter');

  const toggleAudioPlayback = () => {
    if (!isPlayingAudio) {
      sound.playVoiceMemoClick();
      setIsPlayingAudio(true);
    } else {
      sound.playClick();
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-3 md:p-6 select-none font-sans">
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 8 }}
        className="retro-forum-modal-window rounded-none max-w-4xl w-full h-[96dvh] sm:h-[90vh] max-h-[96dvh] sm:max-h-[760px] flex flex-col overflow-hidden text-[#333333] relative"
      >
        {/* Header - 2000s Portal Forum Style */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 retro-forum-modal-header shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 sm:p-1.5 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/40 text-[#ffffff] shrink-0">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-[#ffffff]/20 text-[#f0f9ee] border border-[#ffffff]/40 uppercase tracking-wider">
                  DIRECTOR'S CUT
                </span>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#ffffff] tracking-wide truncate">
                  機密檔案館 // 導演剪輯版後日談
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d8ecd2] mt-0.5 truncate hidden xs:block font-mono">
                ★ 達成 ED8《破曉》終極特權 • 案件後續追蹤報告、委託人手書與全景設定解密
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 sm:p-1.5 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 transition-colors cursor-pointer min-h-[30px] min-w-[30px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center shrink-0 ml-2"
            title="關閉"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 px-3 sm:px-5 py-2 bg-[#edf4ec] border-b border-[#7ca078] text-xs font-mono shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('letter');
            }}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'letter'
                ? 'bg-[#ffffff] border-[#1c3819] text-[#1c3819] font-bold shadow-xs'
                : 'bg-[#f6faf5] border-[#b0cead] text-[#2c4728] hover:bg-[#ffffff]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#1c3819]" />
            <span>半年後委託人致謝函箋</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('audio');
            }}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-[#ffffff] border-[#1c3819] text-[#1c3819] font-bold shadow-xs'
                : 'bg-[#f6faf5] border-[#b0cead] text-[#2c4728] hover:bg-[#ffffff]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-[#1c3819]" />
            <span>機密錄音音軌 ({CLASSIFIED_AUDIO_TRACKS.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('blueprints');
            }}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'blueprints'
                ? 'bg-[#ffffff] border-[#1c3819] text-[#1c3819] font-bold shadow-xs'
                : 'bg-[#f6faf5] border-[#b0cead] text-[#2c4728] hover:bg-[#ffffff]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#1c3819]" />
            <span>大樓物理架構剖析全圖</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('notes');
            }}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#ffffff] border-[#1c3819] text-[#1c3819] font-bold shadow-xs'
                : 'bg-[#f6faf5] border-[#b0cead] text-[#2c4728] hover:bg-[#ffffff]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#854d0e]" />
            <span>製作組幕後設定彩蛋</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#f4f8f3] text-[#1a2e18]">
          {/* Tab 1: Post-Game Thank You Letter from Mr. Chen & Zhang Hao */}
          {activeTab === 'letter' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-[#ffffff] text-[#2c1d11] p-5 sm:p-7 shadow-sm border border-[#a8c2a1] relative">
                {/* Vintage Postmark Stamp */}
                <div className="absolute top-5 right-5 border border-[#8c3a27] text-[#8c3a27] px-2.5 py-1 rotate-3 text-[11px] font-mono font-bold uppercase tracking-wider text-center bg-[#fff8f8]">
                  CITY POST<br />2013-03-18
                </div>

                {/* Metadata Header */}
                <div className="border-b border-[#cde0c7] pb-3 mb-4 text-xs text-[#556e52] font-mono space-y-1">
                  <div><b>【案件編號】</b>：AN-2012-088</div>
                  <div><b>【結案狀態】</b>：正式結案／移送市府工務局及檢察署存檔</div>
                  <div><b>【調查報告附頁】</b>：來自委託人與獲救者的手寫信箋（郵戳日期：2013年春）</div>
                </div>

                {/* Letter Body */}
                <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-[#1a2e18]">
                  <p className="font-bold text-sm sm:text-base border-b border-dashed border-[#a8c2a1] pb-1 inline-block text-[#1c3819]">
                    致 {playerName ? playerName : '親愛的偵探'}：
                  </p>

                  <p>
                    我是陳先生。距離去年夏末那場暴雨中的委託，不知不覺已經過了半年。
                  </p>

                  <p>
                    首先要告訴您一個好消息：張浩的康復狀況比預期還要好。剛從那棟大樓帶他出來的那幾個星期，他一看到白色的衣服或聽見機械鍵盤的打字聲，整個人還會忍不住發抖。但隨著工務局上個月正式將「安祥路88號」的違建夾層強制拆除、打通那座被封死十年的天井後，照進大樓的第一道陽光，似乎終於把他腦海中那些錯亂的「規則」徹底曬乾了。
                  </p>

                  <p>
                    張浩托我把隨信附上的這張舊照片轉交給您——那是他在整理404舊檔案時，在瓦礫堆中找到的1998年四樓住戶合照原件。他說，如果沒有您當時堅持用物理常識與物證一層層拆穿大樓的障眼法，他可能一輩子都會以為自己是一隻被規則困住的怪物。
                  </p>

                  <p>
                    市府已經介入徹查了當年建商與管委會的產權弊案，所有被塗黑的門牌也已重新掛回。那棟大樓如今只是座普通的老舊公寓，不再有什麼深夜打字聲，也不再有誰會在那裡迷失。
                  </p>

                  <p>
                    隨信附上尾款與我們兩人的小小謝禮。
                  </p>

                  <p className="pt-2 font-bold text-[#1c3819]">
                    謝謝您，帶我們回到了現實世界。
                  </p>

                  <div className="pt-6 text-right space-y-1 text-xs sm:text-sm font-bold text-[#1c3819]">
                    <div>陳銘祥、張浩 敬上</div>
                    <div className="text-xs font-normal text-[#556e52]">2013年3月 於 本市</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left: Track List */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[#1c3819] font-bold uppercase tracking-wider mb-1">
                  // DECLASSIFIED CASSETTES
                </div>
                {CLASSIFIED_AUDIO_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playTapeInsert();
                      setSelectedTrack(t);
                      setIsPlayingAudio(false);
                    }}
                    className={`w-full text-left p-3 border transition-all flex flex-col gap-1 cursor-pointer ${
                      selectedTrack.id === t.id
                        ? 'bg-[#ffffff] border-[#1c3819] text-[#1c3819] font-bold shadow-xs'
                        : 'bg-[#f6faf5] border-[#b0cead] text-[#2c4728] hover:bg-[#ffffff]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#1c3819] font-bold">{t.duration}</span>
                      <span className="text-[#556e52]">{t.date.split(' ')[0]}</span>
                    </div>
                    <div className="font-bold text-xs text-[#1c3819] line-clamp-1">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-[#556e52] truncate font-mono">
                      {t.speaker}
                    </div>
                  </button>
                ))}
              </div>

              {/* Right: Audio Player & Transcript */}
              <div className="md:col-span-2 space-y-3.5 bg-[#ffffff] border border-[#7ca078] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#a8c2a1] pb-3 mb-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1c3819]">
                        {selectedTrack.title}
                      </h4>
                      <p className="text-xs font-mono text-[#556e52] mt-0.5">
                        {selectedTrack.speaker} • {selectedTrack.date}
                      </p>
                    </div>

                    <button
                      onClick={toggleAudioPlayback}
                      className={`retro-web-btn px-3 py-1.5 flex items-center gap-1.5 font-mono text-xs font-bold cursor-pointer ${
                        isPlayingAudio
                          ? 'bg-[#1c3819] text-white border-[#1c3819] animate-pulse'
                          : 'bg-[#eef7ec] text-[#1c3819] border-[#1c3819] hover:bg-[#d8edd4]'
                      }`}
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlayingAudio ? '播放中 (44.1kHz)' : '播放錄音音軌'}</span>
                    </button>
                  </div>

                  {/* Audio Waveform Simulator */}
                  <div className="h-9 bg-[#edf4ec] border border-[#a8c2a1] p-1.5 flex items-center justify-between gap-1 mb-3 overflow-hidden">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 transition-all duration-300 ${
                          isPlayingAudio ? 'bg-[#1c3819]' : 'bg-[#a8c2a1]'
                        }`}
                        style={{
                          height: isPlayingAudio
                            ? `${Math.max(15, Math.sin(i * 0.5 + Date.now() * 0.005) * 85 + 15)}%`
                            : '25%'
                        }}
                      />
                    ))}
                  </div>

                  {/* Transcript */}
                  <div className="space-y-2 bg-[#f9fbf8] p-3.5 border border-[#cde0c7] text-xs leading-relaxed text-[#1a2e18]">
                    <div className="text-[10px] font-mono text-[#556e52] border-b border-[#cde0c7] pb-1 uppercase tracking-wider font-bold">
                      // TRANSCRIPT LOG // 語音逐字還原
                    </div>
                    {selectedTrack.transcript.map((line, idx) => (
                      <p key={idx} className={line.includes('張浩') || line.includes('王大偉') || line.includes('林國祥') ? 'text-[#854d0e] font-bold' : 'text-[#2c4728]'}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Director Note */}
                <div className="mt-3 pt-2.5 border-t border-[#cde0c7] text-xs text-[#2b5420] bg-[#eef7ec] p-2.5 border border-[#a8cda0]">
                  {selectedTrack.directorNote}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blueprints' && (
            <div className="space-y-3 bg-[#ffffff] border border-[#7ca078] p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#a8c2a1] pb-2.5">
                <div className="flex items-center gap-2 text-[#1c3819] font-mono text-xs font-bold">
                  <Terminal className="w-4 h-4 text-[#1c3819]" />
                  <span>市政府工務局建管處 1998～2012 違建勘驗剖面報告</span>
                </div>
                <span className="text-[10px] font-mono text-[#1c3819] bg-[#eef7ec] px-2 py-0.5 border border-[#a8cda0] font-bold">
                  STATUS: DEMOLITION ORDER ISSUED
                </span>
              </div>

              <div className="p-3.5 bg-[#f9fbf8] border border-[#cde0c7] font-mono text-xs text-[#1a2e18] space-y-2.5 leading-relaxed">
                <div className="text-[#854d0e] font-bold">【結構解密：空間摺疊的物理真相】</div>
                <p>
                  1. <b>隱形夾層</b>：安祥路88號大樓在1998年竣工前夕，建商為了規避消防容積率，私自將第4層（原定為大型中央空調與備用機房）以雙層隔音石膏板與木作封死，並切斷了電梯第4層之停靠電路。
                </p>
                <p>
                  2. <b>通風管共振</b>：404號房內部殘留的機械打字機，實為當年違法工班記錄物料的設備。由於通風口正對大樓天井，夜晚風切效應帶動打字機金屬構件撞擊，產生了「夜半敲門聲」與「打字聲」的物理現象。
                </p>
                <p>
                  3. <b>心理迷宮</b>：梯間的13階與14階差異，源於三樓半轉角處建商後期加裝的防盜鐵門斜坡。訪客在幽暗光線與心智疲勞下，極易產生空間迷航與多重條款認知障礙。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-3 bg-[#ffffff] border border-[#7ca078] p-4 sm:p-5 shadow-xs">
              <div className="text-[#1c3819] font-mono text-xs font-bold border-b border-[#a8c2a1] pb-2.5">
                // CREATORS COMMENTARY // 製作團隊給偵探的信
              </div>
              <div className="text-xs leading-relaxed text-[#1a2e18] space-y-2.5">
                <p>
                  感謝你一路抽絲剝繭，完成了《安祥路88號》的全部調查！
                </p>
                <p>
                  本遊戲的核心設計理念是「用客觀物證與縝密邏輯，擊碎恐懼與盲從」。規則怪談中最可怕的往往不是超自然怪物，而是當身邊所有人都告訴你「這裡沒有四樓」時，你是否還能堅定信任自己的雙眼與手中的真相。
                </p>
                <p className="text-[#1c3819] font-bold">
                  祝賀你成功迎來【破曉】，救出張浩，並成為一名真正卓越的私家偵探！
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#edf4ec] border-t border-[#7ca078] text-[11px] text-[#385e35] flex items-center justify-between shrink-0">
          <span className="font-mono text-[10px]">DIRECTOR'S CUT ARCHIVE // CASE AN-2012-088</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="retro-web-btn px-3 py-1 text-xs cursor-pointer"
          >
            關閉檔案館
          </button>
        </div>
      </motion.div>
    </div>
  );
};
