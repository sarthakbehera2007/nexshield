import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CyberShieldScene } from './components/three/CyberShieldScene';
import { Navbar } from './components/ui/Navbar';
import { HeroContent } from './components/ui/HeroContent';
import { VideoModal } from './components/ui/VideoModal';
import { ProductShowcase } from './components/ui/ProductShowcase';
import { ArchitectureSection } from './components/ui/ArchitectureSection';
import { AttackStorySection } from './components/ui/AttackStorySection';
import { CopilotPreview } from './components/ui/CopilotPreview';
import { DefenceDemo } from './components/ui/DefenceDemo';
import { FeatureBento } from './components/ui/FeatureBento';
import { TrustSection } from './components/ui/TrustSection';
import { FinalCTA } from './components/ui/FinalCTA';
import { ConsoleModal } from './components/ui/ConsoleModal';
import AdvancedSOCDashboard from './components/ui/AdvancedSOCDashboard';
import DefenceCenter from './components/ui/DefenceCenter';
import HoneypotCenter from './components/ui/HoneypotCenter';
import MobileGatewayCenter from './components/ui/MobileGatewayCenter';
import MobileApp from './mobile/MobileApp';
import { AttackSimulatorHUD } from './components/ui/AttackSimulatorHUD';

gsap.registerPlugin(ScrollTrigger);

// Default scroll state for the 3D scene
const DEFAULT_SCROLL_STATE = {
  cameraPosZ: 5.8,
  cameraPosY: 0,
  shieldPosX: 1.0,
  shieldPosY: 0,
  shieldRotX: 0,
  shieldRotY: -0.12,
  shieldRotZ: 0,
  circuitGlow: 1.0,
};

const SECTION_SCROLL_STATES = [
  { cameraPosZ: 5.8, shieldPosX: 1.0, shieldRotY: -0.12, circuitGlow: 1.0, cameraPosY: 0 },
  { cameraPosZ: 4.8, shieldPosX: 1.0, shieldRotY: 0.22, circuitGlow: 1.5, cameraPosY: 0.1 },
  { cameraPosZ: 4.2, shieldPosX: 0.8, shieldRotY: 0.0, circuitGlow: 2.2, cameraPosY: 0 },
  { cameraPosZ: 4.6, shieldPosX: -0.8, shieldRotY: -0.28, circuitGlow: 1.8, cameraPosY: -0.1 },
  { cameraPosZ: 4.5, shieldPosX: 0, shieldRotY: 0, circuitGlow: 2.8, cameraPosY: 0 },
  { cameraPosZ: 5.6, shieldPosX: 0, shieldRotY: 0.05, circuitGlow: 2.0, cameraPosY: 0.1 },
];

export default function App() {
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('view');
      if (param === 'mobile') return 'mobile-app';
      if (param === 'gateway') return 'mobile-gateway';
      if (param === 'soc') return 'soc';
      if (param === 'defence') return 'defence';
      if (param === 'honeypot') return 'honeypot';
    }
    return 'home';
  });
  const [videoOpen, setVideoOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [isThreatActive, setIsThreatActive] = useState(false);
  const [isDefenseActive, setIsDefenseActive] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollState, setScrollState] = useState(DEFAULT_SCROLL_STATE);

  const handleTriggerAttack = (scenario) => {
    setActiveAlert(scenario);
    setIsThreatActive(true);
    setIsDefenseActive(false);
  };

  const handleResolveThreat = (threat) => {
    if (threat) {
      setIsThreatActive(false);
      setIsDefenseActive(true);
      setTimeout(() => {
        setActiveAlert(null);
        setIsDefenseActive(false);
      }, 7000);
    } else {
      setActiveAlert(null);
      setIsThreatActive(false);
    }
  };

  const scrollContainerRef = useRef(null);
  const heroSceneRef = useRef(null);

  // ScrollTrigger choreography
  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = document.querySelectorAll('.scroll-section');
      sections.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => {
            setCurrentSection(i);
            setScrollState(s => ({ ...s, ...SECTION_SCROLL_STATES[i] }));
          },
          onEnterBack: () => {
            setCurrentSection(i);
            setScrollState(s => ({ ...s, ...SECTION_SCROLL_STATES[i] }));
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  const handleExplore = () => {
    document.querySelector('#showcase')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isThreat = isThreatActive || currentSection === 2 || currentSection === 3;
  const isDefend = isDefenseActive || currentSection === 4 || currentSection === 5;

  return (
    <div className="relative bg-[#05080E] text-[#F4F7FB] overflow-x-hidden">
      {/* Background technical grid */}
      <div className="fixed inset-0 cyber-grid-bg opacity-100 pointer-events-none z-0" />

      {/* Fixed 3D scene viewport — HERO only, then becomes decorative */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CyberShieldScene
          scrollState={{
            ...scrollState,
            shieldPosX: currentSection === 0 ? scrollState.shieldPosX : scrollState.shieldPosX,
          }}
          currentSection={currentSection}
          isThreat={isThreat}
          isDefend={isDefend}
        />
      </div>

      {/* Navbar */}
      <Navbar
        onWatchDemo={() => setVideoOpen(true)}
        onLaunchConsole={() => setConsoleOpen(true)}
        isThreatActive={isThreat}
        isDefenseActive={isDefend}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content Router */}
      {activeView === 'soc' && (
        <div className="relative z-20 pt-20">
          <AdvancedSOCDashboard />
        </div>
      )}

      {activeView === 'defence' && (
        <div className="relative z-20 pt-20">
          <DefenceCenter />
        </div>
      )}

      {activeView === 'honeypot' && (
        <div className="relative z-20 pt-20">
          <HoneypotCenter />
        </div>
      )}

      {activeView === 'mobile-gateway' && (
        <div className="relative z-20 pt-20">
          <MobileGatewayCenter onLaunchMobileView={() => setActiveView('mobile-app')} />
        </div>
      )}

      {activeView === 'mobile-app' && (
        <div className="relative z-20 pt-16 min-h-screen bg-[#05080E] flex flex-col items-center">
          <MobileApp onExitToDesktop={() => setActiveView('home')} />
        </div>
      )}

      {activeView === 'home' && (
      /* Page content */
      <div ref={scrollContainerRef} className="relative z-10">
        {/* SECTION 1: HERO */}
        <section className="scroll-section min-h-screen flex items-center px-5 md:px-12 lg:px-20 pt-20 lg:pt-0">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-24">
            {/* Left — text content */}
            <HeroContent
              onWatchDemo={() => setVideoOpen(true)}
              onLaunchConsole={() => setConsoleOpen(true)}
            />
            {/* Right — 3D scene placeholder (scene is behind, positioned on right by shieldPosX=1.0) */}
            <div className="hidden lg:flex items-center justify-center h-full" aria-hidden="true">
              {/* Telemetry overlay labels */}
              <div className="relative w-full max-w-sm h-96 flex items-center justify-center">
                <div className="font-mono text-[10px] text-[#8293A5] absolute top-4 right-0 text-right leading-relaxed">
                  <div>NEXSHIELD CORE v5.0</div>
                  <div className="text-[#00DFFF]">TITANIUM-GRAPHITE MATRIX</div>
                  <div>SECTOR 07-A · LAT 37°46'N</div>
                </div>
                <div className="font-mono text-[10px] text-[#8293A5] absolute bottom-4 left-0 leading-relaxed">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#19E68C]" />
                    <span>ORBITAL MESH: 3 RINGS ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00DFFF]" />
                    <span>NODE TELEMETRY: 56 / 56</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SOC DASHBOARD */}
        <div className="scroll-section bg-[#05080E]/90 backdrop-blur-sm">
          <ProductShowcase />
        </div>

        {/* SECTION 3: ARCHITECTURE */}
        <div className="scroll-section">
          <ArchitectureSection />
        </div>

        {/* SECTION 4: ATTACK STORY */}
        <div className="scroll-section bg-[#05080E]/90 backdrop-blur-sm">
          <AttackStorySection />
        </div>

        {/* SECTION 5: AI COPILOT */}
        <div className="scroll-section">
          <CopilotPreview />
        </div>

        {/* SECTION 6: DEFENCE DEMO (interactive simulation) */}
        <div className="scroll-section bg-[#05080E]/90 backdrop-blur-sm">
          <DefenceDemo />
        </div>

        {/* FEATURE BENTO */}
        <div className="scroll-section">
          <FeatureBento />
        </div>

        {/* TRUST SECTION */}
        <div className="bg-[#05080E]/90 backdrop-blur-sm">
          <TrustSection />
        </div>

        {/* FINAL CTA */}
        <div className="scroll-section border-t border-[rgba(120,160,190,0.1)]">
          <FinalCTA
            onLaunchConsole={() => setConsoleOpen(true)}
            onExplore={handleExplore}
          />
        </div>

        {/* Footer */}
        <footer className="border-t border-[rgba(120,160,190,0.1)] py-8 px-5 md:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#8293A5]">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M12 2L4 6V13C4 17.4183 7.58172 21 12 21C16.4183 21 20 17.4183 20 13V6L12 2Z" fill="#05080E" stroke="#00DFFF" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8.5 8.5V15.5M8.5 8.5L15.5 15.5M15.5 8.5V15.5" stroke="#00DFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[#F4F7FB] font-semibold">NEXSHIELD</span>
              <span>· Intelligent Cyber Defence · v5.0</span>
            </div>
            <div>Built with Three.js, R3F, GSAP &amp; React</div>
          </div>
        </footer>
      </div>
      )}

      {/* Attack Simulation & Alert Show Mechanism HUD */}
      <AttackSimulatorHUD
        activeAlert={activeAlert}
        onTriggerAttack={handleTriggerAttack}
        onResolveThreat={handleResolveThreat}
      />

      {/* Modals */}
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
      <ConsoleModal isOpen={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  );
}
