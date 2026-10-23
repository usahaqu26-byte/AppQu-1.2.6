import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  HeartPulse,
  AlertOctagon,
  Volume2,
  VolumeX,
  MapPin,
  Camera,
  QrCode,
  CheckCircle,
  Clock,
  ShieldCheck,
  Send,
  Upload,
  Heart,
  Users,
  FileText,
  Radio,
  PhoneCall,
  X,
  Sparkles,
  Lock,
  Unlock,
  Mic,
  MicOff,
  MessageSquare,
  Share2,
  FileDown,
} from 'lucide-react';

import {
  UserProfile,
  EmergencyLog,
  PatrolCheckpoint,
  PatrolLog,
  MusibahItem,
  PiketTask,
  SOSEphemeralRoom,
  SOSChatMessage,
} from '../../types';
import { sireneAudio } from '../../services/sireneAudio';
import { AppQuStorageService } from '../../services/storageAppQu';

interface SiagaQuViewProps {
  currentUser: UserProfile;
  checkpoints: PatrolCheckpoint[];
  patrolLogs: PatrolLog[];
  musibahList: MusibahItem[];
  piketTasks: PiketTask[];
  onUpdateCheckpoints: (cp: PatrolCheckpoint[]) => void;
  onUpdatePatrolLogs: (pl: PatrolLog[]) => void;
  onUpdateMusibah: (m: MusibahItem[]) => void;
  onUpdatePiket: (p: PiketTask[]) => void;
  showNotification: (msg: string) => void;
}

export const SiagaQuView: React.FC<SiagaQuViewProps> = ({
  currentUser,
  checkpoints,
  patrolLogs,
  musibahList,
  piketTasks,
  onUpdateCheckpoints,
  onUpdatePatrolLogs,
  onUpdateMusibah,
  onUpdatePiket,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'darurat' | 'patroli' | 'solidaritas'>('darurat');

  // Geofencing & Witness Access Checks
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(true);
  const isWitnessLocked = (currentUser.witnessCount || 0) < 2;
  const isPanicLocked = isWitnessLocked || !isInsideGeofence;

  // Hold-to-Activate 3 Detik State
  const [holdingType, setHoldingType] = useState<'kemalingan' | 'medis' | 'kebakaran' | 'bencana' | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdIntervalRef = React.useRef<any>(null);

  // 5-Detik Cancel Window State
  const [pendingCancelType, setPendingCancelType] = useState<'kemalingan' | 'medis' | 'kebakaran' | 'bencana' | null>(null);
  const [cancelSecondsLeft, setCancelSecondsLeft] = useState<number>(5);

  // Ephemeral SOS Room & Chat State
  const [sosRoom, setSosRoom] = useState<SOSEphemeralRoom>(() => AppQuStorageService.getSosRoom());
  const [newChatText, setNewChatText] = useState('');
  const [isRecordingSilentAudio, setIsRecordingSilentAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(15);

  // Emergency States
  const [activeEmergency, setActiveEmergency] = useState<EmergencyLog | null>(null);
  const [isSirenSounding, setIsSirenSounding] = useState<boolean>(false);
  const [selectedCctv, setSelectedCctv] = useState<string>('cctv-1');

  // Patrol Scanner Modal
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanningCheckpoint, setScanningCheckpoint] = useState<PatrolCheckpoint | null>(null);

  // Daily Security Log Form Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logCondition, setLogCondition] = useState<'safe' | 'attention' | 'unsafe'>('safe');
  const [logNotes, setLogNotes] = useState('');

  // Donation Modal
  const [donationModalItem, setDonationModalItem] = useState<MusibahItem | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(50000);

  // Hold to activate 3 Detik Handlers
  const handleStartHold = (type: 'kemalingan' | 'medis' | 'kebakaran' | 'bencana') => {
    if (isPanicLocked) {
      if (isWitnessLocked) {
        showNotification('Akses Terkunci: Butuh minimal 2 Saksi Tetangga RT 04 yang terverifikasi!');
      } else {
        showNotification('Akses Terkunci: GPS Anda berada di luar Geofencing radius RT 04!');
      }
      return;
    }

    setHoldingType(type);
    setHoldProgress(0);

    if (navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {}
    }

    let progress = 0;
    holdIntervalRef.current = setInterval(() => {
      progress += (50 / 3000) * 100;
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        setHoldProgress(100);
        setHoldingType(null);

        // Haptic feedback
        if (navigator.vibrate) {
          try {
            navigator.vibrate([200, 100, 200]);
          } catch {}
        }

        // Trigger 5-second Cancel Window
        setPendingCancelType(type);
        setCancelSecondsLeft(5);
      } else {
        setHoldProgress(progress);
      }
    }, 50);
  };

  const handleStopHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldingType(null);
    setHoldProgress(0);
  };

  // 5-Detik Countdown Effect for Cancel Window
  React.useEffect(() => {
    if (!pendingCancelType) return;

    if (cancelSecondsLeft <= 0) {
      // Countdown finished without cancel -> activate emergency!
      const type = pendingCancelType;
      setPendingCancelType(null);
      finalizeEmergencyActivation(type);
      return;
    }

    const timer = setTimeout(() => {
      setCancelSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pendingCancelType, cancelSecondsLeft]);

  // Cancel Emergency activation during 5-second window
  const handleCancelEmergency = () => {
    setPendingCancelType(null);
    setCancelSecondsLeft(5);
    showNotification('Aktivasi Panic Button berhasil DIBATALKAN (Salah Tekan).');
  };

  // Finalize Panic Button Activation
  const finalizeEmergencyActivation = (type: 'kemalingan' | 'medis' | 'kebakaran' | 'bencana') => {
    sireneAudio.startSiren();
    setIsSirenSounding(true);

    const newEmerg: EmergencyLog = {
      id: `sos-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone,
      blockNumber: currentUser.blockNumber,
      type,
      status: 'active',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      notes: `Peringatan darurat kategori ${type.toUpperCase()} diaktifkan dari aplikasi AppQu warga!`,
      coordinates: { lat: -7.7956, lng: 110.3695 },
      nearestCctvId: 'cctv-1',
      cctvName: 'CCTV Pertigaan Blok C & Balai Warga',
      sirenActive: true,
      responders: ['Satpam Pos Utama (Pak Agus)', 'Ketua RT 04 (Pak Hendra)', 'Kang Yanto (Driver TransportasiQu)'],
    };
    setActiveEmergency(newEmerg);

    // Create Ephemeral SOS Chat Room with Live Pinned Location & 15s audio summary
    const updatedRoom: SOSEphemeralRoom = {
      ...sosRoom,
      id: `sos-room-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterBlock: currentUser.blockNumber,
      reporterPhone: currentUser.phone,
      type,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(), // 72 Jam (3 Hari) Auto-Purge
      hoursRemaining: 72,
      liveLocation: {
        lat: -7.7956,
        lng: 110.3695,
        address: `${currentUser.blockNumber}, RT 04 / RW 09`,
        geofenceValid: true,
      },
      audioRecorded: true,
      audioDurationSeconds: 15,
      audioSummaryText: `Auto-Text: "Peringatan darurat ${type.toUpperCase()} diaktifkan oleh ${currentUser.name} di ${currentUser.blockNumber}. Suara sekitar terekam."`,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          senderId: 'system',
          senderName: 'Sistem SiagaQu (Serverless)',
          senderRole: 'Auto-Broadcast',
          text: `🚨 SIAGAQU SOS DIAKTIFKAN: Kategori ${type.toUpperCase()}! Geofence RT 04 Valid. Alarm sirine dibroadcast ke HP warga, Pengurus RT, Hansip, dan Kurir TransportasiQu terdekat.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `msg-${Date.now()}-2`,
          senderId: currentUser.id,
          senderName: `${currentUser.name} (Pelapor)`,
          senderRole: currentUser.roleTitle,
          text: `Tolong ada keadaan darurat ${type.toUpperCase()} di rumah saya! Mohon bantuan warga dan pengurus terdekat.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `msg-${Date.now()}-3`,
          senderId: 'speech-api',
          senderName: 'Smart Rekaman 15s (Web Speech API)',
          senderRole: 'Auto-Text Summary',
          text: `🎙️ Auto-Text: "Peringatan darurat ${type.toUpperCase()} diaktifkan oleh ${currentUser.name} di ${currentUser.blockNumber}..."`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isAudioSummary: true,
        },
        {
          id: `msg-${Date.now()}-4`,
          senderId: 'usr-satpam-1',
          senderName: 'Pak Agus Suparman (Hansip)',
          senderRole: 'Keamanan RT 04',
          text: 'Saya dari Pos Keamanan langsung meluncur membawa perlengkapan!',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isAction: true,
        },
      ],
      quickActionsTriggered: ['Saya Meluncur'],
      escalatedToWhatsApp: false,
    };

    setSosRoom(updatedRoom);
    AppQuStorageService.saveSosRoom(updatedRoom);

    // Simulate 15s silent microphone recording
    setIsRecordingSilentAudio(true);
    setRecordingSeconds(15);
    const recTimer = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(recTimer);
          setIsRecordingSilentAudio(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    showNotification(
      `🚨 SIAGAQU SOS: Sirene berbunyi! Ephemeral SOS Room dibuka & alarm dikirim ke Satpam, RT & Kurir.`
    );
  };

  // Quick Action in SOS Chat Room
  const handleQuickAction = (actionText: string) => {
    const newMsg: SOSChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.roleTitle,
      text: `[Tindakan Cepat]: ${actionText}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isAction: true,
    };

    const updated = {
      ...sosRoom,
      messages: [...sosRoom.messages, newMsg],
      quickActionsTriggered: [...sosRoom.quickActionsTriggered, actionText],
    };
    setSosRoom(updated);
    AppQuStorageService.saveSosRoom(updated);
    showNotification(`Tindakan terkirim: ${actionText}`);
  };

  // Send Custom Message in SOS Chat Room
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const newMsg: SOSChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.roleTitle,
      text: newChatText.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = {
      ...sosRoom,
      messages: [...sosRoom.messages, newMsg],
    };
    setSosRoom(updated);
    AppQuStorageService.saveSosRoom(updated);
    setNewChatText('');
  };

  // Escalation to WhatsApp (Babinsa / Bhabinkamtibmas)
  const handleEscalateToWhatsApp = () => {
    const waText = encodeURIComponent(
      `🚨 *LAPORAN DARURAT SIAGAQU RT 04 / RW 09*\n\n` +
      `Kategori: *${sosRoom.type.toUpperCase()}*\n` +
      `Pelapor: ${sosRoom.reporterName} (${sosRoom.reporterBlock})\n` +
      `Telp: ${sosRoom.reporterPhone}\n` +
      `Waktu: ${sosRoom.createdAt}\n` +
      `Lokasi Live: ${sosRoom.liveLocation.address}\n\n` +
      `Catatan: Laporan resmi diekskalasikan ke Bhabinkamtibmas, Babinsa, dan Pengurus Wilayah.`
    );
    window.open(`https://wa.me/?text=${waText}`, '_blank');

    const updated = { ...sosRoom, escalatedToWhatsApp: true };
    setSosRoom(updated);
    AppQuStorageService.saveSosRoom(updated);
    showNotification('Rekap laporan darurat dikirim via WhatsApp ke Aparat Wilayah.');
  };

  const handleStopSiren = () => {
    sireneAudio.stopSiren();
    setIsSirenSounding(false);
    if (activeEmergency) {
      setActiveEmergency({ ...activeEmergency, sirenActive: false });
    }
    showNotification('Sirene darurat dimatikan.');
  };

  const handleResolveEmergency = () => {
    sireneAudio.stopSiren();
    setIsSirenSounding(false);
    setActiveEmergency(null);

    const resolved = { ...sosRoom, status: 'resolved' as const };
    setSosRoom(resolved);
    AppQuStorageService.saveSosRoom(resolved);
    showNotification('Status darurat telah diselesaikan (Resolved). Data akan auto-purge dari server.');
  };

  // ----------------------------------------------------
  // PATROL CHECKPOINT HANDLER
  // ----------------------------------------------------
  const handleScanCheckpoint = (cp: PatrolCheckpoint) => {
    setScanningCheckpoint(cp);
    setIsScanModalOpen(true);
  };

  const handleConfirmScan = () => {
    if (!scanningCheckpoint) return;

    const time = new Date().toISOString();
    const updated = checkpoints.map((c) =>
      c.id === scanningCheckpoint.id
        ? {
            ...c,
            lastScannedAt: time,
            lastScannedBy: `${currentUser.name} (${currentUser.roleTitle})`,
            status: 'safe' as const,
          }
        : c
    );
    onUpdateCheckpoints(updated);

    const newLog: PatrolLog = {
      id: `pl-${Date.now()}`,
      officerId: currentUser.id,
      officerName: currentUser.name,
      checkpointCode: scanningCheckpoint.code,
      checkpointName: scanningCheckpoint.name,
      condition: 'safe',
      timestamp: time,
      notes: `Verifikasi QR Checkpoint shift malam oleh ${currentUser.name}. Situasi kondusif.`,
    };
    onUpdatePatrolLogs([newLog, ...patrolLogs]);

    setIsScanModalOpen(false);
    setScanningCheckpoint(null);
    showNotification(`Checkpoint ${scanningCheckpoint.name} berhasil di-scan.`);
  };

  const handleSaveSecurityLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: PatrolLog = {
      id: `pl-${Date.now()}`,
      officerId: currentUser.id,
      officerName: currentUser.name,
      checkpointCode: 'PATROLI-KELILING',
      checkpointName: 'Keliling Wilayah RT 04',
      condition: logCondition,
      timestamp: new Date().toISOString(),
      notes: logNotes || 'Laporan situasi patroli harian.',
    };

    onUpdatePatrolLogs([newLog, ...patrolLogs]);
    setIsLogModalOpen(false);
    setLogNotes('');
    showNotification('Laporan situasi keamanan harian tersimpan.');
  };

  // ----------------------------------------------------
  // SOLIDARITAS & DONASI HANDLER
  // ----------------------------------------------------
  const handleDonate = () => {
    if (!donationModalItem) return;

    const updated = musibahList.map((m) => {
      if (m.id === donationModalItem.id) {
        return {
          ...m,
          donationCollected: m.donationCollected + donationAmount,
          donators: [
            {
              id: `dn-${Date.now()}`,
              name: currentUser.name,
              amount: donationAmount,
              time: 'Baru saja',
              block: currentUser.blockNumber,
            },
            ...m.donators,
          ],
        };
      }
      return m;
    });

    onUpdateMusibah(updated);
    setDonationModalItem(null);
    showNotification(
      `Alhamdulillah, donasi kilat Rp ${donationAmount.toLocaleString('id-ID')} tersalurkan secara transparan.`
    );
  };

  const handleTogglePiket = (taskId: string) => {
    const updated = piketTasks.map((t) => (t.id === taskId ? { ...t, isDone: !t.isDone } : t));
    onUpdatePiket(updated);
    showNotification('Status piket gotong royong diperbarui.');
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-100 overflow-hidden">
      {/* Sub Tabs */}
      <div className="bg-white border-b border-stone-200 px-3 py-2 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('darurat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'darurat'
                ? 'bg-red-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>Panic Button</span>
          </button>

          <button
            onClick={() => setActiveTab('patroli')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'patroli'
                ? 'bg-red-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Patroli & Ronda</span>
          </button>

          <button
            onClick={() => setActiveTab('solidaritas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'solidaritas'
                ? 'bg-red-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Tanggap Duka & Piket</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* ========================================================= */}
        {/* TAB 1: PANIC BUTTON & EMERGENCY RESPONSE */}
        {/* ========================================================= */}
        {activeTab === 'darurat' && (
          <div className="space-y-3.5">
            {/* Active Emergency Alert Banner */}
            {activeEmergency && (
              <div className="bg-red-700 text-white rounded-2xl p-4 shadow-lg animate-pulse border-2 border-red-500 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-amber-300 animate-spin" />
                    <span className="font-black text-xs tracking-wider uppercase">
                      SIAGAQU AKTIF: {activeEmergency.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded">
                    {activeEmergency.timestamp}
                  </span>
                </div>

                <div className="text-xs bg-red-900/60 p-2.5 rounded-xl space-y-1">
                  <div>
                    Pelapor: <strong>{activeEmergency.reporterName}</strong> ({activeEmergency.blockNumber})
                  </div>
                  <div>HP: {activeEmergency.reporterPhone}</div>
                  <div className="text-[11px] text-amber-200">
                    Notifikasi Sirene Kencang Terkirim ke Satpam & Pengurus RT!
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {isSirenSounding ? (
                    <button
                      onClick={handleStopSiren}
                      className="flex-1 py-2 bg-white text-red-900 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>Matikan Suara Sirene</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sireneAudio.startSiren();
                        setIsSirenSounding(true);
                      }}
                      className="flex-1 py-2 bg-amber-400 text-stone-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Bunyikan Sirene Lagi</span>
                    </button>
                  )}

                  <button
                    onClick={handleResolveEmergency}
                    className="py-2 px-3 bg-red-950 hover:bg-black text-white rounded-xl text-xs font-bold"
                  >
                    Selesai (Resolve)
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 1. GEOFENCING & SAKSI ACCESS KEY STATUS CARD              */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  {isPanicLocked ? (
                    <Lock className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>Kunci Akses Panic Button RT</span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isPanicLocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isPanicLocked ? 'Terkunci (Locked)' : 'Terbuka (Siaga)'}
                </span>
              </div>

              {/* Requirements Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Syarat 1: 2 Saksi Tetangga */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    (currentUser.witnessCount || 0) >= 2
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div>
                    <span className="block font-bold text-[11px]">Minimal 2 Saksi</span>
                    <span className="text-[10px] text-stone-600">
                      {currentUser.witnessCount || 0}/2 Saksi Terverifikasi
                    </span>
                  </div>
                  {(currentUser.witnessCount || 0) >= 2 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </div>

                {/* Syarat 2: Geofencing Radius RT 04 */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isInsideGeofence
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div>
                    <span className="block font-bold text-[11px]">Geofence RT 04</span>
                    <span className="text-[10px] text-stone-600">
                      {isInsideGeofence ? 'GPS Dalam Radius' : 'GPS Di Luar Radius'}
                    </span>
                  </div>
                  {/* Interactive toggle for testing */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsInsideGeofence(!isInsideGeofence);
                      showNotification(
                        !isInsideGeofence
                          ? 'Simulasi GPS: Posisi berada di dalam Geofence RT 04'
                          : 'Simulasi GPS: Posisi berada di LUAR Geofence RT 04'
                      );
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isInsideGeofence
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-300 text-stone-800'
                    }`}
                  >
                    {isInsideGeofence ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {isPanicLocked && (
                <p className="text-[11px] text-rose-700 bg-rose-50/80 p-2 rounded-xl border border-rose-200 leading-relaxed">
                  ⚠️ <strong>Akses Dibatasi:</strong> Tombol darurat hanya dapat ditekan jika akun
                  memiliki minimal 2 saksi tetangga valid dan GPS berada di radius RT 04 untuk
                  mencegah false alarm.
                </p>
              )}
            </div>

            {/* ========================================================= */}
            {/* 2. BIG PANIC BUTTONS (HOLD TO ACTIVATE 3 DETIK)           */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                  Respon Cepat Darurat Terverifikasi
                </span>
                <h2 className="text-sm font-black text-stone-900">
                  Tekan & Tahan 3 Detik (Hold to Activate)
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Dilengkapi getaran haptic + Jendela Pembatalan 5 Detik untuk mencegah salah tekan.
                </p>
              </div>

              {/* Hold Progress Bar if currently holding */}
              {holdingType && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-1.5 animate-pulse">
                  <div className="flex justify-between text-xs font-bold text-red-900">
                    <span>Menahan tombol {holdingType.toUpperCase()}...</span>
                    <span>{Math.round(holdProgress)}%</span>
                  </div>
                  <div className="w-full bg-red-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-75"
                      style={{ width: `${holdProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-red-700">Tahan terus hingga 100% untuk aktivasi</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-1 select-none">
                {[
                  {
                    type: 'kemalingan' as const,
                    label: 'KEMALINGAN',
                    sub: 'Kejahatan / Gangguan',
                    icon: ShieldAlert,
                    bg: 'from-red-600 to-red-800',
                  },
                  {
                    type: 'medis' as const,
                    label: 'MEDIS / AMBULANS',
                    sub: 'Sakit Kritis / Darurat',
                    icon: HeartPulse,
                    bg: 'from-teal-600 to-emerald-800',
                  },
                  {
                    type: 'kebakaran' as const,
                    label: 'KEBAKARAN',
                    sub: 'Kebocoran Gas / Api',
                    icon: Flame,
                    bg: 'from-amber-600 to-orange-700',
                  },
                  {
                    type: 'bencana' as const,
                    label: 'BENCANA ALAM',
                    sub: 'Pohon Tumbang / Banjir',
                    icon: AlertOctagon,
                    bg: 'from-stone-700 to-stone-900',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isBeingHeld = holdingType === item.type;

                  return (
                    <button
                      key={item.type}
                      type="button"
                      disabled={isPanicLocked}
                      onMouseDown={() => handleStartHold(item.type)}
                      onMouseUp={handleStopHold}
                      onMouseLeave={handleStopHold}
                      onTouchStart={() => handleStartHold(item.type)}
                      onTouchEnd={handleStopHold}
                      className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.bg} text-white flex flex-col items-center justify-center gap-1.5 shadow-md transition-all relative overflow-hidden ${
                        isPanicLocked
                          ? 'opacity-40 cursor-not-allowed grayscale-30'
                          : isBeingHeld
                          ? 'scale-95 ring-4 ring-red-400'
                          : 'hover:scale-[1.02] active:scale-95 cursor-pointer'
                      }`}
                    >
                      {/* Radial Progress overlay */}
                      {isBeingHeld && (
                        <div
                          className="absolute inset-0 bg-white/20 transition-all"
                          style={{ height: `${holdProgress}%`, bottom: 0, top: 'auto' }}
                        />
                      )}
                      <Icon className="w-7 h-7 text-amber-300 relative z-10" />
                      <span className="text-xs font-black relative z-10">{item.label}</span>
                      <span className="text-[9px] text-stone-200 relative z-10">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. POP-UP JENDELA PEMBATALAN 5 DETIK (CANCEL WINDOW)       */}
            {/* ========================================================= */}
            {pendingCancelType && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in zoom-in-95">
                <div className="bg-red-950 text-white rounded-3xl max-w-sm w-full p-5 border-2 border-red-500 shadow-2xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto text-3xl font-black animate-pulse shadow-lg ring-8 ring-red-500/30">
                    {cancelSecondsLeft}
                  </div>

                  <div>
                    <h3 className="text-lg font-black tracking-tight text-amber-300">
                      MENGAKTIFKAN PANIC BUTTON RT
                    </h3>
                    <p className="text-xs text-stone-300 mt-1">
                      Kategori: <strong className="text-white uppercase">{pendingCancelType}</strong>
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Alarm sirene & broadcast ke seluruh RT akan dikirim dalam {cancelSecondsLeft} detik.
                    </p>
                  </div>

                  {/* Prominent Cancel Button to Prevent False Alarms */}
                  <button
                    type="button"
                    onClick={handleCancelEmergency}
                    className="w-full py-3.5 bg-white hover:bg-stone-100 text-red-900 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer"
                  >
                    ✕ BATALKAN DARURAT (Salah Tekan)
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. AUTO EPHEMERAL SOS GROUP CHAT & 15S AUDIO SUMMARY     */}
            {/* ========================================================= */}
            {(activeEmergency || sosRoom.status === 'active') && (
              <div className="bg-white rounded-2xl border-2 border-red-600 shadow-md overflow-hidden space-y-0">
                {/* Ephemeral Group Header */}
                <div className="bg-red-800 text-white p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-sm leading-tight">
                          Ephemeral SOS Group: {sosRoom.type.toUpperCase()}
                        </h3>
                        <span className="text-[9px] bg-red-950 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded">
                          Live
                        </span>
                      </div>
                      <p className="text-[11px] text-red-200">
                        {sosRoom.liveLocation.address}
                      </p>
                    </div>
                  </div>

                  {/* 72 Jam Auto-Purge Countdown */}
                  <div className="text-right">
                    <span className="text-[10px] text-red-200 block">Auto-Purge Server:</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Sisa {sosRoom.hoursRemaining || 72} Jam
                    </span>
                  </div>
                </div>

                {/* Pinned Live Location & Audio Status */}
                <div className="bg-red-50 p-2.5 border-b border-red-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-red-950 font-bold">
                    <MapPin className="w-4 h-4 text-red-700 shrink-0" />
                    <span>PIN LOKASI LIVE: {sosRoom.liveLocation.address}</span>
                  </div>
                  {isRecordingSilentAudio ? (
                    <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <Mic className="w-3 h-3" />
                      <span>Rekam Suara ({recordingSeconds}s)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MicOff className="w-3 h-3" />
                      <span>Audio 15s Selesai</span>
                    </span>
                  )}
                </div>

                {/* Smart Rekaman & Web Speech Auto-Text Summary Box */}
                {sosRoom.audioSummaryText && (
                  <div className="p-3 bg-amber-50/80 border-b border-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-bold text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Smart Rekaman 15s (Auto-Text Summary via Web Speech API):</span>
                    </div>
                    <p className="text-stone-800 italic bg-white p-2 rounded-xl border border-amber-200/80">
                      "{sosRoom.audioSummaryText}"
                    </p>
                  </div>
                )}

                {/* Quick Action Coordination Buttons */}
                <div className="p-2.5 bg-stone-50 border-b border-stone-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Tombol Cepat Koordinasi Warga:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickAction('Saya Meluncur ke Lokasi! 🏃‍♂️')}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg shrink-0 cursor-pointer"
                    >
                      🏃‍♂️ Saya Meluncur
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAction('Hubungi Ambulans / Polsek! 🚑')}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg shrink-0 cursor-pointer"
                    >
                      🚑 Hubungi Ambulans/Polsek
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAction('Blokir Portal Gang Utama! 🛑')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg shrink-0 cursor-pointer"
                    >
                      🛑 Blokir Portal Gang
                    </button>
                  </div>
                </div>

                {/* Chat Messages Log */}
                <div className="p-3 max-h-56 overflow-y-auto space-y-2 bg-stone-100 text-xs">
                  {sosRoom.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-xl ${
                        msg.senderId === 'system'
                          ? 'bg-red-100 text-red-950 border border-red-200 font-medium'
                          : msg.isAudioSummary
                          ? 'bg-amber-100 text-amber-950 border border-amber-200'
                          : msg.isAction
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-200 font-bold'
                          : msg.senderId === currentUser.id
                          ? 'bg-stone-800 text-white ml-6'
                          : 'bg-white text-stone-900 mr-6 border border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 mb-0.5">
                        <span className="font-bold">{msg.senderName} ({msg.senderRole})</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Send Chat Message Form */}
                <form
                  onSubmit={handleSendChatMessage}
                  className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    placeholder="Kirim pesan darurat ke grup..."
                    className="flex-1 bg-stone-100 px-3 py-1.5 rounded-xl text-xs text-stone-900 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Kirim</span>
                  </button>
                </form>

                {/* Footer Controls: Escalation WA & Resolve / Auto-Purge */}
                <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleEscalateToWhatsApp}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Eskalasi WA ke Babinsa/RT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResolveEmergency}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-black text-white rounded-xl font-bold cursor-pointer"
                  >
                    Tandai Selesai (Resolve)
                  </button>
                </div>
              </div>
            )}

            {/* Mini Map & Victims Geolocation Tracking */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <h3 className="text-xs font-bold text-stone-900">
                    Peta Mini Presisi Lokasi Rumah Korban
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-stone-500 font-bold">
                  RT 04 / RW 09
                </span>
              </div>

              {/* Graphic Map Canvas Simulation */}
              <div className="w-full h-40 bg-stone-900 rounded-xl relative overflow-hidden border border-stone-800 flex items-center justify-center">
                {/* Simulated Street Grid */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-stone-700/60"></div>
                <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-stone-700/60"></div>
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-700/60"></div>

                {/* Victim Pin Marker */}
                <div className="relative z-10 flex flex-col items-center animate-bounce">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-4 ring-red-400/40">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono font-bold">
                    Blok C3 No. 12 (Rumah Budi Santoso)
                  </div>
                </div>

                {/* Neighbor Houses Pin */}
                <div className="absolute top-4 left-6 px-1.5 py-0.5 rounded bg-stone-800 text-[8px] text-stone-300">
                  Blok A (Rumah Pak RT)
                </div>
                <div className="absolute bottom-4 right-6 px-1.5 py-0.5 rounded bg-stone-800 text-[8px] text-stone-300">
                  Pos Ronda Utama
                </div>
              </div>

              <div className="text-[11px] text-stone-600 flex justify-between">
                <span>Koordinat: -7.7956° S, 110.3695° E</span>
                <span className="text-emerald-700 font-bold">Jarak ke Pos Satpam: 120m</span>
              </div>
            </div>

            {/* RTSP / Live Stream CCTV Lingkungan Terdekat */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Live Feed CCTV Lingkungan Terdekat</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <span>LIVE RTSP</span>
                </div>
              </div>

              {/* CCTV Video Monitor Simulator */}
              <div className="w-full aspect-video bg-black rounded-xl relative overflow-hidden flex items-center justify-center border border-stone-800">
                <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>
                    {selectedCctv === 'cctv-1'
                      ? 'CAM-01: Pos Ronda & Gerbang'
                      : selectedCctv === 'cctv-2'
                      ? 'CAM-02: Pertigaan Blok C & Fasum'
                      : 'CAM-03: Pintu Belakang Blok D'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-stone-300 bg-black/60 px-1.5 py-0.5 rounded">
                  25 FPS · 1080p · 2026-10-19
                </div>

                {/* Simulated Camera Content */}
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                    <Camera className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-[11px] text-stone-300 font-mono">
                    Streaming Real-Time RTSP RTSP://192.168.1.10{selectedCctv.slice(-1)}/live
                  </div>
                  <div className="text-[9px] text-stone-400">
                    Kamera terhubung lancar. Tidak terdeteksi anomali gerak.
                  </div>
                </div>
              </div>

              {/* CCTV Selector Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cctv-1', label: 'CAM 01: Pos Utama' },
                  { id: 'cctv-2', label: 'CAM 02: Blok C Fasum' },
                  { id: 'cctv-3', label: 'CAM 03: Pintu Belakang' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCctv(c.id)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold truncate transition-all ${
                      selectedCctv === c.id
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SMART PATROLI & RONDA DIGITAL */}
        {/* ========================================================= */}
        {activeTab === 'patroli' && (
          <div className="space-y-3.5">
            <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Sistem Patroli Mandiri Warga RT 04
                </span>
                <span className="text-[9px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded font-mono">
                  Shift Malam 22.00 - 05.00
                </span>
              </div>
              <h2 className="text-sm font-bold">QR Checkpoint Sudut Perumahan</h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Petugas satpam dan warga yang bertugas ronda wajib memindai QR Code di setiap titik pos
                sesuai jam patroli untuk memastikan keamanan fisik perumahan.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Isi Daily Security Log (Safe / Unsafe)</span>
                </button>
              </div>
            </div>

            {/* Checkpoint Cards List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800 px-1">
                Daftar Titik Checkpoint Patroli
              </div>

              {checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">
                        {cp.code}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 mt-1">{cp.name}</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">{cp.locationDesc}</p>
                    </div>

                    <button
                      onClick={() => handleScanCheckpoint(cp)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-2xs active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-300" />
                      <span>Scan Titik</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                    <span>Terakhir di-scan: {cp.lastScannedBy || 'Belum di-scan'}</span>
                    <span className="font-bold text-emerald-700">
                      {cp.lastScannedAt ? new Date(cp.lastScannedAt).toLocaleTimeString('id-ID') : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Riwayat Patroli Terbaru */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800 px-1">
                Log Catatan Keamanan & Patroli
              </div>

              {patrolLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{log.checkpointName}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        log.condition === 'safe'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.condition.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">{log.notes}</p>
                  <div className="text-[10px] text-stone-400 pt-0.5">
                    Petugas: {log.officerName} · {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TANGGAP DUKA & DOMPET SOLIDARITAS */}
        {/* ========================================================= */}
        {activeTab === 'solidaritas' && (
          <div className="space-y-3.5">
            {/* Musibah Items */}
            {musibahList.map((m) => {
              const pct = Math.min(100, Math.round((m.donationCollected / m.donationTarget) * 100));

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border-2 border-stone-300 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white">
                      BERITA MUSIBAH RESMI
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">{m.date}</span>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900 leading-snug">{m.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                    {m.description}
                  </p>

                  {/* Dompet Solidaritas Digital Progress */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">Dompet Solidaritas Warga</span>
                      <span className="font-mono font-black text-emerald-800">
                        Rp {m.donationCollected.toLocaleString('id-ID')} / Rp{' '}
                        {m.donationTarget.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>Terkumpul: {pct}% dari target santunan</span>
                      <button
                        onClick={() => setDonationModalItem(m)}
                        className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-xs active:scale-95"
                      >
                        Kirim Donasi Kilat ➔
                      </button>
                    </div>

                    {/* Real-Time Donators List */}
                    <div className="pt-2 border-t border-stone-200 space-y-1">
                      <span className="text-[10px] font-bold text-stone-600 block">
                        Transparansi Donatur ({m.donators.length} Warga Berpartisipasi):
                      </span>
                      <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] pr-1">
                        {m.donators.map((d) => (
                          <div
                            key={d.id}
                            className="flex justify-between items-center text-stone-600 py-0.5 border-b border-stone-100"
                          >
                            <span>
                              {d.name} ({d.block})
                            </span>
                            <span className="font-mono font-bold text-emerald-700">
                              Rp {d.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Otomasi Piket Gotong Royong */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900">
                    Otomasi Jadwal Piket Gotong Royong
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Pembagian tugas takziah, pengurusan jenazah, konsumsi, dan parkir.
                  </p>
                </div>
                <Users className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="space-y-2">
                {piketTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 capitalize">
                          Tugas {task.taskType.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 font-medium">
                          {task.blockNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600 mt-0.5">
                        {task.assignedFamily}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        Jadwal: {task.shiftTime}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePiket(task.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        task.isDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                      }`}
                    >
                      {task.isDone ? '✓ Terlaksana' : 'Belum Selesai'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL: QR SCAN CHECKPOINT */}
      {/* ---------------------------------------------------- */}
      {isScanModalOpen && scanningCheckpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 text-center space-y-3 animate-in fade-in zoom-in-95">
            <h3 className="text-xs font-bold text-stone-900">{scanningCheckpoint.name}</h3>
            <div className="w-48 h-48 bg-stone-900 rounded-2xl mx-auto flex flex-col items-center justify-center relative overflow-hidden border-2 border-emerald-500">
              <QrCode className="w-32 h-32 text-emerald-400" />
              <div className="absolute inset-x-0 h-1 bg-emerald-400 animate-pulse top-1/2"></div>
              <span className="text-[10px] font-mono text-emerald-300 mt-2">
                Scanning {scanningCheckpoint.code}...
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Petugas: <strong>{currentUser.name}</strong> ({currentUser.roleTitle})
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleConfirmScan}
                className="py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Simpan Scan Valid
              </button>
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: DAILY SECURITY LOG */}
      {/* ---------------------------------------------------- */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-stone-900">Form Daily Security Log</h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSecurityLog} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700">Status Kondisi Lingkungan</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {(['safe', 'attention', 'unsafe'] as const).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setLogCondition(c)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        logCondition === c
                          ? c === 'safe'
                            ? 'bg-emerald-800 text-white shadow'
                            : c === 'attention'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-red-700 text-white shadow'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {c === 'safe' ? 'Safe (Aman)' : c === 'attention' ? 'Perhatian' : 'Unsafe'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700">Catatan Kejadian / Observasi</label>
                <textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Lampu tiang PJU Blok C padam, sudah ditandai. Pintu portal utama dikunci jam 23.00 WIB."
                  className="w-full mt-1 p-2 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
              >
                Kirim Laporan Keamanan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: DONASI KILAT SOLIDARITAS */}
      {/* ---------------------------------------------------- */}
      {donationModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold text-stone-900">Dompet Solidaritas Warga</h3>
              <button
                onClick={() => setDonationModalItem(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-1">
              <div>
                Penerima: <strong>{donationModalItem.victimFamily}</strong>
              </div>
              <div className="text-[11px] text-stone-400">
                Pencatatan real-time terbuka untuk seluruh warga RT 04.
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700">Pilih Nominal Donasi</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {[20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      donationAmount === amt
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Rp {amt.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDonate}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Salurkan Donasi Rp {donationAmount.toLocaleString('id-ID')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
