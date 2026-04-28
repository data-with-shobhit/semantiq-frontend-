'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  SiPython, SiPostgresql, SiRedis, SiDocker, 
  SiGooglegemini, SiLangchain, SiSupabase, SiCloudflare, 
  SiFastapi, SiCelery, SiUpstash 
} from 'react-icons/si';

/* ─── Data ─── */
const FEATURES = [
  { label: 'CRAG', desc: 'Corrective Retrieval — self-grades answers and retries when retrieval quality is low.' },
  { label: 'HYBRID SEARCH', desc: 'Dense + sparse (SPLADE) retrieval, CrossEncoder reranked, top-5 only.' },
  { label: 'ZERO HALLUCINATION', desc: 'LLM-as-judge on every answer. Grounded or silent.' },
  { label: 'RAGAS BUILT-IN', desc: 'Faithfulness · Context Precision · Answer Relevancy — measured, not assumed.' },
  { label: 'STRATEGY ENGINE', desc: 'Analyzes every document and selects the optimal chunking strategy automatically.' },
  { label: 'MULTI-DOMAIN', desc: 'Financial · Legal · Medical · Clinical · Scientific · Technical · General' },
];

const STACK_ITEMS = [
  { name: 'Python', Icon: SiPython, color: '#3776AB' },
  { name: 'Postgres', Icon: SiPostgresql, color: '#4169E1' },
  { name: 'Redis', Icon: SiRedis, color: '#DC382D' },
  { name: 'Docker', Icon: SiDocker, color: '#2496ED' },
  { name: 'Voyage', Icon: null, color: '#8B5CF6' },
  { name: 'Grok', Icon: null, color: '#FFFFFF' },
  { name: 'Gemini', Icon: SiGooglegemini, color: '#8E75B2' },
  { name: 'Qdrant', Icon: null, color: '#E9084A' },
  { name: 'Langgraph', Icon: null, color: '#FFFFFF' },
  { name: 'Langchain', Icon: SiLangchain, color: '#FFFFFF' },
  { name: 'Langsmith', Icon: null, color: '#FFFFFF' },
  { name: 'Upstash', Icon: SiUpstash, color: '#00E9A3' },
  { name: 'Supabase', Icon: SiSupabase, color: '#3ECF8E' },
  { name: 'Cloudflare', Icon: SiCloudflare, color: '#F38020' },
  { name: 'FastAPI', Icon: SiFastapi, color: '#009688' },
  { name: 'Celery', Icon: SiCelery, color: '#37814A' },
  { name: 'Tavily', Icon: null, color: '#2563EB' },
];

const DOMAINS = [
  'Financial', 'Legal', 'Medical', 'Clinical', 'Scientific', 'Technical', 'General',
];

const PROCESS_STEPS = [
  { title: 'INGEST', desc: 'Upload documents in any format — PDF, DOCX, TXT, Markdown.' },
  { title: 'ANALYZE', desc: 'Strategy engine selects optimal chunking and embedding approach.' },
  { title: 'RETRIEVE', desc: 'Hybrid dense + sparse search with cross-encoder reranking.' },
  { title: 'CORRECT', desc: 'CRAG self-grades retrieval quality and retries if needed.' },
  { title: 'VALIDATE', desc: 'LLM-as-judge ensures answer is grounded. No hallucinations.' },
  { title: 'DELIVER', desc: 'Precise, cited answers with RAGAS quality scores.' },
];

/* ─── SVG Icons (from inspo) ─── */
function EyeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="currentColor">
      <path d="M60 0C30 0 5 30 0 30s30 30 60 30 55-30 60-30S90 0 60 0zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" />
      <circle cx="60" cy="30" r="8" />
      <path d="M60 10v8M60 42v8M42 30h8M70 30h8" strokeWidth="2" stroke="currentColor" fill="none" />
    </svg>
  );
}

function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="5" x2="35" y2="35" />
      <line x1="15" y1="35" x2="35" y2="35" />
      <line x1="35" y1="15" x2="35" y2="35" />
    </svg>
  );
}

/* ─── Brush Stroke SVG (grainy white swoosh inspired by inspo/1.png) ─── */
function BrushStroke() {
  return (
    <svg
      viewBox="0 0 1200 600"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <path
        d="M100,500 C150,500 200,480 250,430 C320,360 350,280 400,220 C450,160 500,120 560,100 C620,80 680,100 720,160 C760,220 780,300 820,350 C860,400 920,420 980,400 C1040,380 1080,340 1120,300 C1160,260 1200,240 1200,240"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="100"
        strokeLinecap="round"
        filter="url(#grain)"
      />
      <path
        d="M80,520 C140,510 210,490 260,440 C330,370 360,290 410,230 C460,170 510,130 570,110 C630,90 690,110 730,170 C770,230 790,310 830,360 C870,410 930,430 990,410 C1050,390 1090,350 1130,310"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="120"
        strokeLinecap="round"
        filter="url(#grain)"
      />
    </svg>
  );
}

function F1CarTopDownSVG({ className }: { className?: string }) {
  // Faces Right (X is forward)
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="36" y="4" width="4" height="12" fill="#ef4444" />
      <path d="M36 8 L 28 6 L 28 14 L 36 12 Z" fill="#ef4444" />
      <path d="M28 6 L 12 6 L 12 14 L 28 14 Z" fill="#b91c1c" />
      <rect x="0" y="2" width="4" height="16" fill="#ef4444" />
      <rect x="24" y="0" width="8" height="4" rx="1" fill="#171717" />
      <rect x="24" y="16" width="8" height="4" rx="1" fill="#171717" />
      <rect x="4" y="0" width="8" height="4" rx="1" fill="#171717" />
      <rect x="4" y="16" width="8" height="4" rx="1" fill="#171717" />
      <circle cx="20" cy="10" r="3" fill="#000" />
    </svg>
  );
}

export default function LandingPage() {
  const processRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start center", "end center"]
  });

  const trackT = [0.100, 0.264, 0.273, 0.282, 0.291, 0.300, 0.308, 0.317, 0.326, 0.335, 0.464, 0.473, 0.482, 0.491, 0.500, 0.523, 0.532, 0.541, 0.550, 0.558, 0.652, 0.661, 0.670, 0.679, 0.688, 0.697, 0.705, 0.714, 0.723, 0.852, 0.861, 0.870, 0.879, 0.888, 0.900];
  const trackX = [15, 85, 89.4, 92.5, 94.4, 95, 94.4, 92.5, 89.4, 85, 30, 25.6, 22.5, 20.6, 20, 20, 20.6, 22.5, 25.6, 30, 70, 74.4, 77.5, 79.4, 80, 79.4, 77.5, 74.4, 70, 15, 10.6, 7.5, 5.6, 5, 5];
  const trackY = [10, 10, 10.6, 12.5, 15.6, 20, 24.4, 27.5, 29.4, 30, 30, 30.6, 32.5, 35.6, 40, 50, 54.4, 57.5, 59.4, 60, 60, 60.6, 62.5, 65.6, 70, 74.4, 77.5, 79.4, 80, 80, 80.6, 82.5, 85.6, 90, 95];
  const trackR = [0, 0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 180, 157.5, 135, 112.5, 90, 90, 67.5, 45, 22.5, 0, 0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 180, 157.5, 135, 112.5, 90, 90];

  const carLeft = useTransform(scrollYProgress, trackT, trackX.map(x => `${x}%`));
  const carTop = useTransform(scrollYProgress, trackT, trackY.map(y => `${y}%`));
  const carRotate = useTransform(scrollYProgress, trackT, trackR);
  
  // Mobile vertical progress
  const carProgress = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <div className="relative min-h-screen bg-[#111113] overflow-x-hidden text-white">
      {/* Ambient Blobs for Frosted Glass Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#3f3f46]/40 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#52525b]/30 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[30%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-[#27272a]/50 blur-[120px] pointer-events-none z-0" />
      
      {/* Frosted Glass + Noise Overlay */}
      <div className="fixed inset-0 backdrop-blur-[80px] bg-[#1c1c1c]/40 z-0 pointer-events-none noise-overlay border-t border-white/5 shadow-[inset_0_0_100px_rgba(255,255,255,0.02)]" />

      {/* Content Wrapper */}
      <div className="relative z-10">

      {/* ═══════════════════════════════════════════
          SECTION 1: HERO (inspired by inspo/1.png)
          Giant brand name, brush stroke, editorial layout
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col">
        {/* Top navigation bar */}
        <nav className="relative z-20 flex justify-between items-start px-6 md:px-12 pt-8">
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors"
            title="View Project on GitHub"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <div className="flex gap-4 md:gap-6 items-center">
            <Link
              href="/signin"
              className="px-6 py-2 border border-white/20 text-white font-mono text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-white/80 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Brush stroke background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <BrushStroke />
        </div>

        {/* Main hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-12 pb-40 md:pb-64">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
            {/* Left: Giant stacked headline + Tagline */}
            <div className="flex flex-col">
              <h1 className="font-display text-white uppercase leading-[0.85] tracking-tight flex items-baseline"
                  style={{ fontSize: 'clamp(4rem, 14vw, 14rem)' }}>
                SEMANTIQ<span className="inline-block w-[0.18em] h-[0.18em] bg-red-500 rounded-full ml-[0.05em]"></span>
              </h1>
              <p className="font-mono text-white font-semibold text-xs md:text-sm uppercase tracking-[0.2em] max-w-lg mt-6 lg:mt-8">
                Corrective Intelligence • Self-grading retrieval • Zero hallucinations
              </p>
            </div>

            {/* Right: Decorative elements */}
            <div className="flex flex-col items-end shrink-0">
              <ArrowIcon className="w-8 h-8 md:w-12 md:h-12 text-white translate-x-4 md:translate-x-7 translate-y-[120px] md:translate-y-[230px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: ABOUT (inspired by inspo/2.png)
          Large "ABOUT" + description
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-24 md:py-40 border-t border-white/10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Left: Big heading */}
          <div className="lg:w-1/2">
            <h2 className="font-display text-white uppercase leading-[0.85]"
                style={{ fontSize: 'clamp(5rem, 12vw, 12rem)' }}>
              ABOUT
            </h2>
            <p className="font-display text-white/30 uppercase leading-[0.85] -mt-2"
               style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              THE SYSTEM
            </p>
          </div>

          {/* Right: Description */}
          <div className="lg:w-1/2 flex flex-col justify-end gap-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-4">Creative By Nature. Strategic By Mind.</p>
              <p className="font-mono text-sm md:text-base leading-relaxed text-white/70 max-w-lg">
                Semantiq is a CRAG-powered document intelligence platform that retrieves,
                self-corrects, and answers with precision across financial, legal, medical,
                and scientific documents. Every answer is grounded. Every retrieval is validated.
                No hallucinations — ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: CORE CAPABILITIES (inspo/3.png)
          Big heading + 2×2 grid of capabilities
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-24 md:py-40 border-t border-white/10">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left side */}
          <div className="lg:w-1/2">
            <h2 className="font-display text-white uppercase leading-[0.85]"
                style={{ fontSize: 'clamp(4rem, 10vw, 10rem)' }}>
              CORE<br/>CAPABILITIES
            </h2>
          </div>

          {/* Right side: Skill grid */}
          <div className="lg:w-1/2 flex items-end">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              <div>
                <h3 className="font-display text-2xl md:text-4xl uppercase text-white mb-2">Corrective Retrieval</h3>
                <p className="font-mono text-sm text-white/40 uppercase tracking-wider">CRAG Protocol</p>
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-4xl uppercase text-white mb-2">Hybrid Search</h3>
                <p className="font-mono text-sm text-white/40 uppercase tracking-wider">Dense + Sparse</p>
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-4xl uppercase text-white mb-2">Quality Metrics</h3>
                <p className="font-mono text-sm text-white/40 uppercase tracking-wider">RAGAS Evaluation</p>
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-4xl uppercase text-white mb-2">Strategy Engine</h3>
                <p className="font-mono text-sm text-white/40 uppercase tracking-wider">Auto Chunking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: PROCESS (inspo/4.png)
          Dark bg, 3×2 grid process steps
          ═══════════════════════════════════════════ */}
      <section ref={processRef} className="relative z-10 bg-card px-6 md:px-12 py-24 md:py-40 border-t border-white/10">
        <div className="mb-16">
          <h2 className="font-display text-white uppercase leading-[0.85]"
              style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}>
            THE<br/>PROCESS
          </h2>
        </div>

        {/* Desktop Complex Circuit Track */}
        <div className="hidden lg:block relative w-full aspect-square max-w-4xl mx-auto mt-24 mb-16">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {/* The Track Path (Restored beautifully smooth Q-curves) */}
            <path 
              id="london-circuit" 
              d="M 15 10 L 85 10 Q 95 10 95 20 Q 95 30 85 30 L 30 30 Q 20 30 20 40 L 20 50 Q 20 60 30 60 L 70 60 Q 80 60 80 70 Q 80 80 70 80 L 15 80 Q 5 80 5 90 L 5 95" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="4" 
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* The Racing Line (dashed red) */}
            <path 
              d="M 15 10 L 85 10 Q 95 10 95 20 Q 95 30 85 30 L 30 30 Q 20 30 20 40 L 20 50 Q 20 60 30 60 L 70 60 Q 80 60 80 70 Q 80 80 70 80 L 15 80 Q 5 80 5 90 L 5 95" 
              fill="none" 
              stroke="rgba(239,68,68,0.4)" 
              strokeWidth="0.5" 
              strokeDasharray="2 2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Nodes on Track */}
            <circle cx="15" cy="10" r="1.5" fill="#ef4444" className="drop-shadow-[0_0_2px_rgba(239,68,68,0.8)]" />
            <circle cx="85" cy="10" r="1" fill="#27272a" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <circle cx="30" cy="30" r="1" fill="#27272a" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <circle cx="20" cy="50" r="1" fill="#27272a" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <circle cx="70" cy="80" r="1" fill="#27272a" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <circle cx="15" cy="80" r="1.5" fill="white" className="drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
          </svg>

          {/* Start Flag */}
          <div className="absolute flex flex-col items-center opacity-80 animate-pulse -translate-x-1/2 -translate-y-1/2" style={{ left: '9%', top: '10%' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <span className="text-[10px] text-green-500 font-mono font-bold uppercase tracking-widest mt-1">Start</span>
          </div>

          {/* Finish Flag */}
          <div className="absolute flex flex-col items-center opacity-80 -translate-x-1/2 -translate-y-1/2" style={{ left: '15%', top: '86%' }}>
            <span className="text-[10px] text-white font-mono font-bold uppercase tracking-widest mb-1">Finish</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
              <path d="M4 9h16"></path>
              <path d="M12 3v12"></path>
            </svg>
          </div>

          {/* F1 Car Animated on Path via CSS Mapping */}
          <motion.div 
            className="absolute z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]"
            style={{ left: carLeft, top: carTop, rotate: carRotate }}
          >
            <F1CarTopDownSVG />
          </motion.div>

          {/* Text Labels Overlay (Positioned explicitly AWAY from track lines) */}
          {[
            { step: PROCESS_STEPS[0], x: "15%", y: "10%", transform: "-translate-y-[130%] -translate-x-1/4" },
            { step: PROCESS_STEPS[1], x: "85%", y: "10%", transform: "-translate-y-[130%] -translate-x-[75%]" },
            { step: PROCESS_STEPS[2], x: "30%", y: "30%", transform: "-translate-y-[130%] -translate-x-1/4" },
            { step: PROCESS_STEPS[3], x: "20%", y: "50%", transform: "-translate-y-[50%] translate-x-[20%]" },
            { step: PROCESS_STEPS[4], x: "70%", y: "80%", transform: "translate-y-[30%] -translate-x-[75%]" },
            { step: PROCESS_STEPS[5], x: "15%", y: "80%", transform: "-translate-y-[130%] -translate-x-1/4" },
          ].map((item, i) => (
            <div key={item.step.title} className={`absolute flex flex-col items-center lg:items-start text-center lg:text-left w-[180px] lg:w-[200px] ${item.transform}`} style={{ left: item.x, top: item.y }}>
              <p className="font-mono text-xs text-red-500 uppercase tracking-wider mb-2">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-display text-2xl uppercase text-white mb-2">
                {item.step.title}
              </h3>
              <p className="font-mono text-sm text-white/50 leading-relaxed bg-[#111113]/60 backdrop-blur-sm p-2 rounded border border-white/5">
                {item.step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Simple Vertical Layout */}
        <div className="flex flex-col gap-16 lg:hidden mt-16 relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
          
          {/* Start Flag Mobile */}
          <div className="absolute -top-12 left-[23px] -translate-x-1/2 flex flex-col items-center opacity-80 animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <span className="text-[10px] text-green-500 font-mono font-bold uppercase tracking-widest mt-1">Start</span>
          </div>

          {/* Finish Flag Mobile */}
          <div className="absolute -bottom-16 left-[23px] -translate-x-1/2 flex flex-col items-center opacity-80">
            <span className="text-[10px] text-white font-mono font-bold uppercase tracking-widest mb-1">Finish</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
              <path d="M4 9h16"></path>
              <path d="M12 3v12"></path>
            </svg>
          </div>

          <motion.div 
            className="absolute left-[23px] -translate-x-1/2 z-10 w-[40px] h-[20px]"
            style={{ top: carProgress }}
          >
            <div className="rotate-90"> {/* Car faces down on vertical track */}
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="36" y="4" width="4" height="12" fill="#ef4444" />
                <path d="M36 8 L 28 6 L 28 14 L 36 12 Z" fill="#ef4444" />
                <path d="M28 6 L 12 6 L 12 14 L 28 14 Z" fill="#b91c1c" />
                <rect x="0" y="2" width="4" height="16" fill="#ef4444" />
                <rect x="24" y="0" width="8" height="4" rx="1" fill="#171717" />
                <rect x="24" y="16" width="8" height="4" rx="1" fill="#171717" />
                <rect x="4" y="0" width="8" height="4" rx="1" fill="#171717" />
                <rect x="4" y="16" width="8" height="4" rx="1" fill="#171717" />
                <circle cx="20" cy="10" r="3" fill="#000" />
              </svg>
            </div>
          </motion.div>
          
          {PROCESS_STEPS.map((step, i) => (
             <div key={step.title} className="pl-16 relative">
                <div className="absolute left-[19px] top-2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                <p className="font-mono text-xs text-white/30 uppercase tracking-wider mb-2">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-xl uppercase text-white mb-2">{step.title}</h3>
                <p className="font-mono text-sm text-white/50">{step.desc}</p>
             </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: PHILOSOPHY (inspo/5.png)
          Giant quote + description
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-24 md:py-40 border-t border-white/10">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left: Giant quote */}
          <div className="lg:w-3/5">
            <blockquote className="font-display text-white uppercase leading-[0.9] tracking-tight"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 6rem)' }}>
              INTELLIGENCE IS NOT JUST WHAT IT RETRIEVES. INTELLIGENCE IS HOW IT CORRECTS.
            </blockquote>
          </div>

          {/* Right: Philosophy text */}
          <div className="lg:w-2/5 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl md:text-2xl uppercase text-white mb-4">Design Philosophy</h3>
              <p className="font-mono text-sm text-white/50 leading-relaxed">
                Good retrieval is more than fetching data — it&apos;s about solving problems,
                validating context, and delivering answers you can trust. Every response is
                measured against faithfulness, precision, and relevancy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6: FEATURES (inspo/6.png style grid)
          Terminal-styled feature cards
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-24 md:py-40 border-t border-white/10">
        <h2 className="font-display text-white uppercase leading-[0.85] mb-16"
            style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}>
          SELECTED<br/>FEATURES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="bg-background p-8 md:p-12 group hover:bg-white/[0.03] transition-colors corner-accents"
            >
              <h3 className="font-display text-xl md:text-2xl uppercase text-white mb-4 cyber-glitch" data-text={f.label}>
                {f.label}
              </h3>
              <p className="font-mono text-sm text-white/40 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7: DOMAINS (inspo/7.png)
          Giant heading + domain pills
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-24 md:py-40 border-t border-white/10">
        <h2 className="font-display text-white uppercase leading-[0.85] mb-16"
            style={{ fontSize: 'clamp(3rem, 7vw, 8rem)' }}>
          DOMAINS &<br/>SECTORS
        </h2>

        <div className="flex flex-wrap gap-4">
          {DOMAINS.map((d) => (
            <div
              key={d}
              className="px-8 py-4 font-display text-lg md:text-xl uppercase text-white border border-white/15 hover:bg-white hover:text-background transition-all duration-200 cursor-default"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-end mt-20">
          <p className="font-mono text-sm text-white/40 max-w-md leading-relaxed">
            Semantiq operates across every knowledge domain — from financial regulations
            to clinical research — adapting retrieval strategy per document type.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8: STACK USED (Infinite Marquee)
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 md:py-32 border-t border-white/10 overflow-hidden bg-black">
        <div className="px-6 md:px-12 mb-16">
          <h2 className="font-display text-white uppercase leading-[0.85]" style={{ fontSize: 'clamp(3rem, 7vw, 8rem)' }}>
            STACK &<br/>INFRASTRUCTURE
          </h2>
        </div>
        
        {/* Infinite Scrolling Marquee */}
        <div className="relative w-full flex overflow-hidden py-8">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            className="flex gap-6 shrink-0 items-center whitespace-nowrap pl-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
          >
            {[...STACK_ITEMS, ...STACK_ITEMS].map((item, i) => (
              <div key={`${item.name}-${i}`} className="flex items-center gap-6 px-8 py-6 border border-white/10 bg-background/50 backdrop-blur-sm min-w-[220px] shrink-0 corner-accents group hover:bg-white/[0.05] hover:border-red-500/30 transition-all">
                {item.Icon ? (
                  <item.Icon className="w-8 h-8 transition-transform group-hover:scale-110" style={{ color: item.color }} />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-sm transition-transform group-hover:scale-110 border" style={{ color: item.color, borderColor: `${item.color}50`, backgroundColor: `${item.color}15` }}>
                    {item.name.charAt(0)}
                  </div>
                )}
                <span className="font-display uppercase text-xl md:text-2xl text-white/60 group-hover:text-white tracking-widest transition-colors">{item.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════
          SECTION 9: CTA / CONTACT
          "LET'S BUILD TOGETHER"
          ═══════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-24 md:py-40 border-t border-white/10 flex flex-col justify-center items-center">
        <h2 className="font-display text-white uppercase leading-[0.85] text-center tracking-tight mb-16"
            style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}>
          LET&apos;S BUILD<br/>TOGETHER
        </h2>
        
        <div className="flex flex-col items-center gap-12 mt-24 md:mt-40">
          <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em]">Connect With Me</p>
          <div className="flex gap-24 md:gap-48 lg:gap-64">
            <a 
              href="https://www.linkedin.com/in/shobhit-mohadikar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-6 text-white hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              <span className="font-display text-lg md:text-xl uppercase tracking-widest border-b border-transparent group-hover:border-red-500 pb-1">
                LinkedIn
              </span>
            </a>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=shobhitmohadikar@gmail.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-6 text-white hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span className="font-display text-lg md:text-xl uppercase tracking-widest border-b border-transparent group-hover:border-red-500 pb-1">
                Gmail
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/10 bg-background px-6 md:px-12 py-16 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-display text-3xl md:text-4xl uppercase text-white tracking-wider flex items-baseline">
            SEMANTIQ<span className="inline-block w-[0.18em] h-[0.18em] bg-red-500 rounded-full ml-[0.05em]"></span>
          </p>
          <p className="font-mono text-xs md:text-sm text-white/30 uppercase tracking-widest text-center md:text-right">
            Built with Claude Code and Antigravity
          </p>
        </div>
      </footer>
    </div>
    </div>
  );
}
