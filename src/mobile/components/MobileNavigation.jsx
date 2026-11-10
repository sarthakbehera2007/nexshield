import React from 'react';
import { Home, ShieldAlert, AlertOctagon, Radio, Settings } from 'lucide-react';

export default function MobileNavigation({ currentTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'sos', label: 'SOS', icon: AlertOctagon, highlight: true },
    { id: 'incidents', label: 'Incidents', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#080B12]/95 backdrop-blur-md border-t border-[#162132] px-2 py-2 flex justify-around items-center z-50">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = currentTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex flex-col items-center gap-1 transition ${
              t.highlight
                ? 'text-[#FF4545]'
                : isActive
                ? 'text-[#00D4FF]'
                : 'text-[#8995A7] hover:text-[#F4F7FB]'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition ${
                t.highlight
                  ? 'bg-[#FF4545]/20 text-[#FF4545] border border-[#FF4545]/40 shadow-[0_0_10px_rgba(255,69,69,0.3)]'
                  : isActive
                  ? 'bg-[#00D4FF]/15 text-[#00D4FF]'
                  : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium leading-none">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

