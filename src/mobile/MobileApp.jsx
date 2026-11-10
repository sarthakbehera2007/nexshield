import React, { useState, useEffect } from 'react';
import { mobileGatewayService } from './services/mobileApi';
import DeviceRegistration from './pages/DeviceRegistration';
import MobileDashboard from './pages/MobileDashboard';
import SecurityCenter from './pages/SecurityCenter';
import SOSPage from './pages/SOSPage';
import IncidentPage from './pages/IncidentPage';
import SettingsPage from './pages/SettingsPage';
import MobileNavigation from './components/MobileNavigation';
import { Shield, ArrowLeft } from 'lucide-react';

export default function MobileApp({ onExitToDesktop }) {
  const [device, setDevice] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Read persisted device from storage
    const stored = localStorage.getItem('nxs_mobile_device');
    if (stored) {
      try {
        setDevice(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('nxs_mobile_device');
      }
    }

    // Monitor connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Heartbeat loop
  useEffect(() => {
    if (!device || !isOnline) return;

    const interval = setInterval(async () => {
      try {
        await mobileGatewayService.sendHeartbeat(device.device_id, device.api_key, {
          app_version: device.app_version || '1.0.0',
          connection_status: 'ONLINE',
        });
      } catch (err) {
        console.debug('Heartbeat ping failed', err);
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [device, isOnline]);

  const handleDeregister = () => {
    if (window.confirm('Deregister this agent and remove credentials?')) {
      localStorage.removeItem('nxs_mobile_device');
      setDevice(null);
      setCurrentTab('home');
    }
  };

  return (
    <div className="bg-[#05080E] text-[#F4F7FB] min-h-screen font-sans flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-[#080B12] border-x border-[#162132] flex flex-col relative shadow-2xl">
        {/* Mobile Top App Bar */}
        <header className="px-4 py-3 bg-[#080B12]/90 backdrop-blur-md border-b border-[#162132] flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center text-[#00D4FF]">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-[#00D4FF]">NEXSHIELD</span>
              <span className="text-[9px] text-[#8995A7] block font-mono leading-none">MOBILE GATEWAY</span>
            </div>
          </div>

          {onExitToDesktop && (
            <button
              onClick={onExitToDesktop}
              className="px-2.5 py-1 bg-[#162132] hover:bg-[#202C40] rounded text-[10px] font-mono text-[#8995A7] flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Desktop View
            </button>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {!device ? (
            <DeviceRegistration onRegistered={setDevice} />
          ) : (
            <>
              {currentTab === 'home' && (
                <MobileDashboard
                  device={device}
                  onNavigate={setCurrentTab}
                  isOnline={isOnline}
                />
              )}
              {currentTab === 'security' && (
                <SecurityCenter device={device} isOnline={isOnline} />
              )}
              {currentTab === 'sos' && (
                <SOSPage device={device} isOnline={isOnline} />
              )}
              {currentTab === 'incidents' && (
                <IncidentPage device={device} />
              )}
              {currentTab === 'settings' && (
                <SettingsPage
                  device={device}
                  onDeregister={handleDeregister}
                  isOnline={isOnline}
                />
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation (Only visible when registered) */}
        {device && (
          <MobileNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
        )}
      </div>
    </div>
  );
}

