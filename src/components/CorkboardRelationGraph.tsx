import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pin,
  Sparkles,
  Filter,
  RefreshCw,
  Link2,
  X
} from 'lucide-react';
import { CASE_HYPOTHESES, WEEK1_CASE_HYPOTHESES, RULE_CONTRADICTIONS } from '../data/deductionData';
import { RULES_DATA, INVENTORY_ITEMS } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import { FreeNote } from '../types';

export interface CorkboardNode {
  id: string;
  type: 'clue' | 'rule' | 'hypothesis' | 'note';
  title: string;
  subtitle?: string;
  categoryName: string;
  pinColor: 'red' | 'amber' | 'emerald' | 'cyan' | 'purple' | 'rose';
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  isUnlocked: boolean;
  lockHint?: string;
  summaryText: string;
  evidenceId?: string;
  ruleId?: string;
  connectedTo: string[]; // target node ids
}

interface CorkboardRelationGraphProps {
  inventory: string[];
  obtainedRules: string[];
  freeNotes?: FreeNote[];
  completedWeek1?: boolean;
  onSelectNode?: (node: CorkboardNode) => void;
  onEstablishThoughtLink?: (clueA: string, clueB: string, deductionTitle: string, insight: string) => void;
}

export const CorkboardRelationGraph: React.FC<CorkboardRelationGraphProps> = ({
  inventory,
  obtainedRules,
  freeNotes = [],
  completedWeek1 = false,
  onSelectNode,
  onEstablishThoughtLink
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'clue' | 'rule' | 'hypothesis' | 'note'>('all');
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number } | null>(null);

  // Build the node graph containing ONLY obtained/discovered items, rules, unlocked hypotheses and notes
  const nodes: CorkboardNode[] = useMemo(() => {
    const list: CorkboardNode[] = [];
    const activeHypotheses = completedWeek1 ? CASE_HYPOTHESES : WEEK1_CASE_HYPOTHESES;

    // 1. Evidence / Clue Nodes (ONLY obtained items)
    const evidenceEntries = [
      { id: 'key_504', title: '504號房鑰匙', cat: '實體物證', pin: 'emerald' as const, defaultX: 18, defaultY: 22, desc: '開啟五樓空置套房之鑰，解開失蹤者居所。' },
      { id: 'shredded_letter', title: '寄給404的信', cat: '核心物證', pin: 'amber' as const, defaultX: 38, defaultY: 20, desc: '拼合信件顯現「不要遵守規則」與未來郵戳。' },
      { id: 'building_blueprints', title: '違建圖紙與加蓋公文', cat: '核心物證', pin: 'purple' as const, defaultX: 60, defaultY: 22, desc: '證實1998年四樓私設密封機房與十年產權糾紛。' },
      { id: 'guard_keycard', title: '中控室感應磁扣', cat: '安全物證', pin: 'cyan' as const, defaultX: 20, defaultY: 52, desc: '刷開四樓暗門，背面寫有反鎖避難代碼。' },
      { id: 'tape_recorder', title: '張浩隨身錄音筆', cat: '關鍵證言', pin: 'amber' as const, defaultX: 80, defaultY: 30, desc: '記錄失蹤者在四樓直面怪異的最後呼喊。' },
      { id: 'old_case_file', title: '陳年怪異案卷', cat: '歷史物證', pin: 'rose' as const, defaultX: 15, defaultY: 78, desc: '記錄歷年來失蹤者的共同認知偏誤軌跡。' },
      { id: 'old_camera_film', title: '柯達黑白底片筒', cat: '核心物證', pin: 'purple' as const, defaultX: 82, defaultY: 72, desc: '1998年404真實居民生活照，破除怪物恐懼。' }
    ].filter(ev => completedWeek1 || ev.id === 'key_504');

    evidenceEntries.forEach(ev => {
      if (inventory.includes(ev.id)) {
        const itemData = INVENTORY_ITEMS[ev.id];
        list.push({
          id: `ev_${ev.id}`,
          type: 'clue',
          title: itemData?.name || ev.title,
          subtitle: ev.cat,
          categoryName: '現場物證',
          pinColor: ev.pin,
          x: nodePositions[`ev_${ev.id}`]?.x ?? ev.defaultX,
          y: nodePositions[`ev_${ev.id}`]?.y ?? ev.defaultY,
          isUnlocked: true,
          evidenceId: ev.id,
          summaryText: itemData?.detail || ev.desc,
          connectedTo: activeHypotheses.filter(h => h.requiredItemIds.includes(ev.id)).map(h => `hypo_${h.id}`)
        });
      }
    });

    // 2. Rule Nodes (ONLY obtained rules)
    const ruleEntries = [
      { id: 'rule_guard', title: '《警衛工作規則》', cat: '官方規約', pin: 'red' as const, defaultX: 28, defaultY: 42, desc: '要求忽視紅衣警衛、嚴格巡視樓梯間。' },
      { id: 'rule_resident', title: '《住戶規則》', cat: '住戶規約', pin: 'red' as const, defaultX: 48, defaultY: 40, desc: '規定大樓無四樓、嚴禁深夜開門。' },
      { id: 'rule_elevator', title: '《電梯乘用規則》', cat: '系統規則', pin: 'cyan' as const, defaultX: 72, defaultY: 48, desc: '提示遇停電應閉眼、嚴禁按空白鍵。' },
      { id: 'rule_cctv', title: '《監視器操作指引》', cat: '安控指引', pin: 'amber' as const, defaultX: 42, defaultY: 62, desc: '指導切換第4頻道解除認知干擾。' },
      { id: 'rule_404', title: '《404號房手寫紙條》', cat: '私密留言', pin: 'purple' as const, defaultX: 62, defaultY: 65, desc: '張浩留下的血淚警語：「規則是活的」。' }
    ].filter(r => completedWeek1 || (r.id !== 'rule_cctv' && r.id !== 'rule_404'));

    ruleEntries.forEach(r => {
      if (obtainedRules.includes(r.id)) {
        const ruleData = RULES_DATA[r.id];
        const displayTitle = !completedWeek1 && ruleData?.week1Title 
          ? `《${ruleData.week1Title}》` 
          : (ruleData?.title ? `《${ruleData.title}》` : r.title);
        const displaySubtitle = !completedWeek1 && ruleData?.week1Subtitle
          ? ruleData.week1Subtitle
          : r.cat;
        list.push({
          id: `rule_${r.id}`,
          type: 'rule',
          title: displayTitle,
          subtitle: displaySubtitle,
          categoryName: completedWeek1 ? '大樓規則' : '現場文件',
          pinColor: r.pin,
          x: nodePositions[`rule_${r.id}`]?.x ?? r.defaultX,
          y: nodePositions[`rule_${r.id}`]?.y ?? r.defaultY,
          isUnlocked: true,
          ruleId: r.id,
          summaryText: (!completedWeek1 && ruleData?.week1Subtitle) ? ruleData.week1Subtitle : (ruleData?.subtitle || r.desc),
          connectedTo: []
        });
      }
    });

    // 3. Unlocked Hypotheses Nodes (Golden Pins) - only show when conditions are met
    activeHypotheses.forEach((hypo, idx) => {
      const isUnlocked = hypo.requiredRuleIds.every(r => obtainedRules.includes(r)) &&
                         hypo.requiredItemIds.every(i => inventory.includes(i));
      if (isUnlocked) {
        const defaultPositions = [
          { x: 30, y: 82 },
          { x: 50, y: 84 },
          { x: 70, y: 82 },
          { x: 86, y: 55 }
        ];
        const pos = defaultPositions[idx % defaultPositions.length];
        list.push({
          id: `hypo_${hypo.id}`,
          type: 'hypothesis',
          title: hypo.title,
          subtitle: completedWeek1 ? '已貫通假說' : '已搜查疑點',
          categoryName: completedWeek1 ? '案情假說' : '現場疑點',
          pinColor: 'amber',
          x: nodePositions[`hypo_${hypo.id}`]?.x ?? pos.x,
          y: nodePositions[`hypo_${hypo.id}`]?.y ?? pos.y,
          isUnlocked: true,
          summaryText: hypo.keyDeduction,
          connectedTo: hypo.requiredItemIds.map(i => `ev_${i}`)
        });
      }
    });

    // 4. Free Notes Nodes (User created notes)
    freeNotes.slice(0, 8).forEach((fn, idx) => {
      const pinMap: Record<string, 'amber' | 'emerald' | 'cyan' | 'purple' | 'red' | 'rose'> = {
        amber: 'amber',
        emerald: 'emerald',
        cyan: 'cyan',
        purple: 'purple',
        crimson: 'red',
        rose: 'rose',
        neutral: 'cyan'
      };
      const pin = pinMap[fn.colorTag || 'amber'] || 'cyan';
      list.push({
        id: fn.id,
        type: 'note',
        title: fn.customTagLabel ? `[${fn.customTagLabel}] ${fn.text.slice(0, 10)}...` : fn.text.slice(0, 14),
        subtitle: '偵探便箋',
        categoryName: '自由手記',
        pinColor: pin,
        x: nodePositions[fn.id]?.x ?? (15 + (idx % 4) * 22),
        y: nodePositions[fn.id]?.y ?? (30 + Math.floor(idx / 4) * 35),
        isUnlocked: true,
        summaryText: fn.text,
        connectedTo: []
      });
    });

    return list;
  }, [inventory, obtainedRules, freeNotes, nodePositions, completedWeek1]);

  // Red string connections between active, unlocked nodes
  const stringConnections = useMemo(() => {
    const connections: { from: CorkboardNode; to: CorkboardNode; type: 'evidence' | 'contradiction' | 'thought_link' }[] = [];

    // Direct connections declared in nodes
    nodes.forEach(nodeA => {
      nodeA.connectedTo.forEach(targetId => {
        const nodeB = nodes.find(n => n.id === targetId);
        if (nodeB) {
          connections.push({
            from: nodeA,
            to: nodeB,
            type: nodeA.pinColor === 'purple' || nodeB.pinColor === 'purple' ? 'thought_link' : 'evidence'
          });
        }
      });
    });

    // Contradiction links between guard & resident rules if both exist
    const guardNode = nodes.find(n => n.id === 'rule_rule_guard');
    const residentNode = nodes.find(n => n.id === 'rule_rule_resident');
    if (guardNode && residentNode) {
      connections.push({
        from: guardNode,
        to: residentNode,
        type: 'contradiction'
      });
    }

    // Blueprint to Shredded Letter connection if both obtained (Week 2 only)
    if (completedWeek1) {
      const blueprintNode = nodes.find(n => n.id === 'ev_building_blueprints');
      const letterNode = nodes.find(n => n.id === 'ev_shredded_letter');
      if (blueprintNode && letterNode) {
        connections.push({
          from: blueprintNode,
          to: letterNode,
          type: 'thought_link'
        });
      }

      // Film to tape recorder connection if both obtained
      const filmNode = nodes.find(n => n.id === 'ev_old_camera_film');
      const tapeNode = nodes.find(n => n.id === 'ev_tape_recorder');
      if (filmNode && tapeNode) {
        connections.push({
          from: filmNode,
          to: tapeNode,
          type: 'thought_link'
        });
      }
    }

    return connections;
  }, [nodes, completedWeek1]);

  // Handle Dragging Nodes on the Corkboard
  const handleMouseDownNode = (e: React.MouseEvent, node: CorkboardNode) => {
    e.stopPropagation();
    sound.playPinTack();
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);

    setIsDraggingNode(node.id);
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: node.x,
      initialY: node.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingNode || !dragStartPos.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStartPos.current.mouseX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartPos.current.mouseY) / rect.height) * 100;

    const newX = Math.max(8, Math.min(90, dragStartPos.current.initialX + deltaXPercent));
    const newY = Math.max(10, Math.min(88, dragStartPos.current.initialY + deltaYPercent));

    setNodePositions(prev => ({
      ...prev,
      [isDraggingNode]: { x: newX, y: newY }
    }));
  };

  const handleMouseUp = () => {
    if (isDraggingNode) {
      setIsDraggingNode(null);
      dragStartPos.current = null;
    }
  };

  const handleResetLayout = () => {
    sound.playPaper();
    setNodePositions({});
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Filtered nodes
  const visibleNodes = nodes.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'clue') return n.type === 'clue';
    if (filterType === 'rule') return n.type === 'rule';
    if (filterType === 'hypothesis') return n.type === 'hypothesis';
    if (filterType === 'note') return n.type === 'note';
    return true;
  });

  return (
    <div 
      className="relative w-full h-[580px] md:h-[620px] rounded-2xl overflow-hidden border-4 border-amber-950/80 shadow-2xl flex flex-col select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Real Corkboard Texture Backdrop */}
      <div 
        className="absolute inset-0 bg-[#321c0e] opacity-95"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(75, 42, 22, 0.95), rgba(26, 14, 7, 0.98)),
            radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px'
        }}
      />

      {/* Decorative Wooden Frame Inner Shadow & Grid Lines */}
      <div className="absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.85)] pointer-events-none" />

      {/* Top Toolbar */}
      <div className="relative z-20 px-3 md:px-4 py-2 bg-neutral-950/90 backdrop-blur-md border-b border-amber-900/60 flex flex-wrap items-center justify-between gap-2 text-neutral-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-900/70 border border-amber-600/80 flex items-center justify-center text-amber-300 shadow-md">
            <Pin className="w-3.5 h-3.5 text-amber-400 rotate-45" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold font-serif text-amber-200 flex items-center gap-1.5">
              <span>軟木塞紅線線索牆</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 font-mono">
                已釘選 {nodes.length} 項
              </span>
            </h4>
          </div>
        </div>

        {/* Filter Chips & Reset */}
        <div className="flex items-center gap-1 flex-wrap text-xs font-mono">
          <button
            onClick={() => {
              sound.playClick();
              setFilterType('all');
            }}
            className={`px-2 py-0.5 rounded-md border text-[11px] transition-all ${
              filterType === 'all' 
                ? 'bg-amber-600 text-neutral-950 font-bold border-amber-400 shadow-sm' 
                : 'bg-neutral-900/90 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
          >
            全部 ({nodes.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilterType('clue');
            }}
            className={`px-2 py-0.5 rounded-md border text-[11px] transition-all ${
              filterType === 'clue' 
                ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-sm' 
                : 'bg-neutral-900/90 text-emerald-400/80 border-emerald-900/80 hover:text-emerald-300'
            }`}
          >
            物證 ({nodes.filter(n => n.type === 'clue').length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilterType('rule');
            }}
            className={`px-2 py-0.5 rounded-md border text-[11px] transition-all ${
              filterType === 'rule' 
                ? 'bg-red-600 text-white font-bold border-red-400 shadow-sm' 
                : 'bg-neutral-900/90 text-red-400/80 border-red-900/80 hover:text-red-300'
            }`}
          >
            規則 ({nodes.filter(n => n.type === 'rule').length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setFilterType('hypothesis');
            }}
            className={`px-2 py-0.5 rounded-md border text-[11px] transition-all ${
              filterType === 'hypothesis' 
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-300 shadow-sm' 
                : 'bg-neutral-900/90 text-amber-300 border-amber-900/80 hover:text-amber-200'
            }`}
          >
            {completedWeek1 ? '假說' : '疑點'} ({nodes.filter(n => n.type === 'hypothesis').length})
          </button>

          <button
            onClick={handleResetLayout}
            title="重設卡片排版位置"
            className="p-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-amber-300 transition-all ml-1"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Corkboard Interactive Canvas */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair"
      >
        {/* Empty State when no items have been acquired yet */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 pointer-events-none">
            <div className="bg-neutral-950/85 border border-amber-900/80 rounded-2xl p-6 max-w-md shadow-2xl backdrop-blur-md space-y-3 pointer-events-auto">
              <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400 mx-auto">
                <Pin className="w-6 h-6 rotate-45" />
              </div>
              <h5 className="text-base font-bold font-serif text-amber-200">
                軟木塞牆尚未釘選任何實體物證
              </h5>
              <p className="text-xs text-neutral-400 font-serif leading-relaxed">
                {completedWeek1 
                  ? '軟木塞牆會隨你在大樓探索拾獲的【實體物證】、解讀的【大樓規則】與貫通的【案情假說】動態釘選上牆並建立紅線關係網。'
                  : '軟木塞牆會記錄你在第一輪調查中獲得的【現場物證】、【大樓規約】與搜查出的【疑點】。'}
              </p>
              <div className="text-[11px] text-amber-400/80 font-mono bg-amber-950/40 p-2 rounded-lg border border-amber-900/50">
                {completedWeek1
                  ? '提示：前往一樓大廳、電梯或五樓探索以獲取第一批線索。'
                  : '提示：向一樓警衛獲取鑰匙並前往五樓 504 號房展開搜救！'}
              </div>
            </div>
          </div>
        )}

        {/* SVG Canvas for Connected Red Strings & Glowing Thought Threads */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <filter id="corkStringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
            </filter>
            <filter id="corkPurpleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#c084fc" floodOpacity="0.9" />
            </filter>
          </defs>

          {stringConnections.map((conn, idx) => {
            const isHighlighted = 
              selectedNodeId === conn.from.id || 
              selectedNodeId === conn.to.id ||
              hoveredNodeId === conn.from.id ||
              hoveredNodeId === conn.to.id;

            const isContradiction = conn.type === 'contradiction';
            const isThoughtLink = conn.type === 'thought_link';

            const x1 = `${conn.from.x}%`;
            const y1 = `${conn.from.y}%`;
            const x2 = `${conn.to.x}%`;
            const y2 = `${conn.to.y}%`;

            return (
              <g key={`cork_conn_${idx}`}>
                {/* String shadow */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#000000"
                  strokeWidth={isHighlighted ? 3.5 : 2}
                  strokeOpacity={0.6}
                  strokeLinecap="round"
                  transform="translate(1, 2)"
                />

                {/* Visible Red / Purple Cord */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isThoughtLink 
                      ? '#c084fc' 
                      : isContradiction 
                        ? '#ef4444' 
                        : isHighlighted 
                          ? '#f87171' 
                          : '#b91c1c'
                  }
                  strokeWidth={isHighlighted ? 3 : isThoughtLink ? 2.5 : 1.8}
                  strokeDasharray={isContradiction ? '5,4' : undefined}
                  filter={isThoughtLink ? 'url(#corkPurpleGlow)' : 'url(#corkStringGlow)'}
                  strokeOpacity={isHighlighted ? 1 : 0.8}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* Node Cards on Corkboard */}
        {visibleNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          const pinColors = {
            red: 'bg-red-600 border-red-300 shadow-[0_3px_6px_rgba(220,38,38,0.8)]',
            amber: 'bg-amber-500 border-amber-200 shadow-[0_3px_6px_rgba(245,158,11,0.8)]',
            emerald: 'bg-emerald-500 border-emerald-200 shadow-[0_3px_6px_rgba(16,185,129,0.8)]',
            cyan: 'bg-cyan-500 border-cyan-200 shadow-[0_3px_6px_rgba(6,182,212,0.8)]',
            purple: 'bg-purple-600 border-purple-300 shadow-[0_3px_8px_rgba(168,85,247,0.9)]',
            rose: 'bg-neutral-600 border-neutral-400 shadow-[0_3px_6px_rgba(0,0,0,0.6)]'
          };

          return (
            <div
              key={node.id}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 40 : isHovered ? 30 : 20
              }}
              onMouseDown={(e) => handleMouseDownNode(e, node)}
              onMouseEnter={() => {
                setHoveredNodeId(node.id);
                sound.playStringConnect();
              }}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 group`}
            >
              {/* Pushpin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                <div className={`w-3.5 h-3.5 rounded-full border-2 ${pinColors[node.pinColor]} transition-transform duration-200 group-hover:scale-125`} />
                <div className="w-0.5 h-1.5 bg-neutral-400 shadow-sm" />
              </div>

              {/* Note / Index Card */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className={`w-36 sm:w-44 p-2 rounded-xl border transition-all backdrop-blur-md shadow-lg relative text-left ${
                  isSelected
                    ? 'bg-neutral-900/95 border-amber-400 ring-2 ring-amber-500/50 text-neutral-100'
                    : node.pinColor === 'purple'
                      ? 'bg-neutral-900/90 border-purple-500/80 text-purple-100 shadow-purple-950/60'
                      : node.type === 'hypothesis'
                        ? 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-amber-950/60'
                        : 'bg-neutral-900/85 border-neutral-700/80 hover:border-neutral-500 text-neutral-200'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-1 border-b border-neutral-800 pb-0.5 mb-1">
                  <span className={`text-[8.5px] font-mono px-1 py-0.1 rounded font-bold ${
                    node.pinColor === 'purple'
                      ? 'bg-purple-950 text-purple-300 border border-purple-700'
                      : node.pinColor === 'emerald'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : node.pinColor === 'red'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-neutral-800 text-neutral-300'
                  }`}>
                    {node.subtitle || node.categoryName}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                </div>

                {/* Title */}
                <h5 className="text-[11px] font-bold font-serif leading-snug line-clamp-1 text-amber-200">
                  {node.title}
                </h5>

                {/* Short Snippet */}
                <p className="text-[9.5px] text-neutral-400 font-serif line-clamp-2 mt-0.5 leading-relaxed">
                  {node.summaryText}
                </p>

                {/* Connection Count */}
                {node.connectedTo.length > 0 && (
                  <div className="mt-1 pt-0.5 border-t border-neutral-800/80 flex items-center justify-between text-[8.5px] font-mono text-amber-400">
                    <span>{node.connectedTo.length} 條紅線</span>
                    <span>點擊查看</span>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}

        {/* COMPACT BOTTOM BAR INSPECTOR - DOES NOT OBSTRUCT THE BOARD */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute left-3 right-3 bottom-3 bg-neutral-950/95 border border-amber-600/80 rounded-xl p-3 shadow-2xl backdrop-blur-xl z-50 text-neutral-200"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Left info */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg border shrink-0 ${
                    selectedNode.pinColor === 'purple'
                      ? 'bg-purple-950 border-purple-500 text-purple-300'
                      : 'bg-amber-950 border-amber-600 text-amber-300'
                  }`}>
                    <Pin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        【{selectedNode.categoryName}】
                      </span>
                      <h4 className="text-xs md:text-sm font-bold font-serif text-neutral-100 truncate">
                        {selectedNode.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-300 font-serif line-clamp-1 mt-0.5">
                      {selectedNode.summaryText}
                    </p>
                  </div>
                </div>

                {/* Right Actions & Links */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {selectedNode.connectedTo.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
                      <Link2 className="w-3 h-3 text-amber-400" />
                      <span className="text-neutral-400">關聯:</span>
                      <span className="text-amber-300 font-bold">{selectedNode.connectedTo.length} 項</span>
                    </div>
                  )}

                  {selectedNode.isUnlocked && selectedNode.pinColor !== 'purple' && (
                    <button
                      onClick={() => {
                        if (onEstablishThoughtLink) {
                          onEstablishThoughtLink(
                            selectedNode.title,
                            '軟木塞黑板思維貫通',
                            `【${selectedNode.title}】的客觀實證`,
                            `偵探透過黑板紅線推演，成功將【${selectedNode.title}】納入真相證據鏈，解開關鍵疑點！`
                          );
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-600 text-purple-200 text-xs font-serif font-bold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      <span>貫通思維</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
