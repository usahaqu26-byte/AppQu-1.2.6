import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  ShoppingBag,
  Users,
  ShieldAlert,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  CheckCheck,
  Check,
  Clock,
  Trash2,
  Lock,
  Phone,
  Eye,
  EyeOff,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  X,
  Volume2,
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  ShieldCheck,
  UserX,
  CheckCircle2,
} from 'lucide-react';
import {
  UserProfile,
  ChatThread,
  ChatMessage,
  ChatCategory,
  SOSHistoryRecord,
} from '../../types';
import { AppQuChatStorage } from '../../services/chatIndexedDB';

interface ChatQuViewProps {
  currentUser: UserProfile;
  initialThreadId?: string | null;
  onOpenPanic?: () => void;
  showNotification: (msg: string) => void;
}

export const ChatQuView: React.FC<ChatQuViewProps> = ({
  currentUser,
  initialThreadId = null,
  onOpenPanic,
  showNotification,
}) => {
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState<ChatCategory>('transaksi');
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialThreadId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SOS History & BAP Modal states
  const [sosHistoryList, setSosHistoryList] = useState<SOSHistoryRecord[]>([]);
  const [selectedBAPRecord, setSelectedBAPRecord] = useState<SOSHistoryRecord | null>(null);

  // Media & Extra Features states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [maskPhoneState, setMaskPhoneState] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam atau pesan mencurigakan');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordIntervalRef = useRef<any>(null);

  // Quick Reply presets tailored to Indonesian hyperlocal context
  const quickReplies: Record<ChatCategory, string[]> = {
    transaksi: [
      'Saya sudah di lokasi jemput/antar',
      'Pesanan apakah sudah siap dibungkus?',
      'Bisa COD di Pos Ronda RT 04?',
      'Tolong ditunggu 5 menit ya Pak',
      'Alamat patokan: Rumah pagar hijau',
      'Baik mas, terima kasih banyak!',
    ],
    komunitas: [
      'Siap hadir kerja bakti',
      'Iuran paguyuban sudah saya transfer',
      'Mohon izin tukar jadwal ronda',
      'Terima kasih infonya Pak RT',
      'Kondisi lingkungan aman kondusif',
    ],
    sos: [
      '🚨 SAYA MELUNCUR KE LOKASI!',
      'Hubungi Ambulans & Puskesmas',
      'Kunci Portal Gang 1, 2, 3!',
      'Hubungi Bhabinkamtibmas Polsek',
      'Warga harap bawa senter & pentungan',
    ],
  };

  // Load Threads and SOS Records from local IndexedDB
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Run auto-purge check on expired transactions (24-48h)
      await AppQuChatStorage.autoPurgeExpired();

      const loadedThreads = await AppQuChatStorage.getThreads();
      setThreads(loadedThreads);

      const sosList = await AppQuChatStorage.getSOSHistory();
      setSosHistoryList(sosList);

      if (initialThreadId && !selectedThreadId) {
        setSelectedThreadId(initialThreadId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to BroadcastChannel & custom events
    const unsubscribe = AppQuChatStorage.subscribe((event) => {
      if (event.type === 'NEW_MESSAGE' && event.message) {
        if (event.message.threadId === selectedThreadId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === event.message.id)) return prev;
            return [...prev, event.message];
          });
          scrollToBottom();
        }
      }
      loadData();
    });

    return () => {
      unsubscribe();
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  // When selected thread changes, load messages
  useEffect(() => {
    if (selectedThreadId) {
      AppQuChatStorage.getMessages(selectedThreadId).then((msgs) => {
        setMessages(msgs);
        scrollToBottom();
      });
    }
  }, [selectedThreadId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const currentThread = threads.find((t) => t.id === selectedThreadId) || null;

  // Handle Send Text / Media Message
  const handleSendMessage = async (customText?: string, isSpeechTranscript = false) => {
    const textToSend = customText !== undefined ? customText : inputText.trim();
    if (!textToSend && !attachedImage) return;
    if (!selectedThreadId) return;

    // Check if user is frozen due to 3 reports
    if (AppQuChatStorage.isUserFrozen(currentUser.id)) {
      showNotification('Akun Anda dibekukan sementara karena telah menerima 3 laporan warga.');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      threadId: selectedThreadId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.roleTier,
      senderPhoneRaw: currentUser.phone || '081200001111',
      senderPhoneMasked: AppQuChatStorage.maskPhone(currentUser.phone || '081200001111'),
      text: textToSend,
      imageUrl: attachedImage || undefined,
      isSpeechTranscript,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
    };

    setInputText('');
    setAttachedImage(null);

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    scrollToBottom();

    await AppQuChatStorage.sendMessage(newMsg);

    // If sending to merchant or driver, simulate quick realistic bot reply after 1.5s
    if (currentThread?.subType === 'usaha' && !isSpeechTranscript) {
      setTimeout(async () => {
        const replyMsg: ChatMessage = {
          id: `reply_${Date.now()}`,
          threadId: selectedThreadId,
          senderId: currentThread.targetId || 'biz_auto',
          senderName: currentThread.title,
          senderRole: 'Pedagang',
          senderPhoneRaw: currentThread.targetPhoneRaw,
          senderPhoneMasked: AppQuChatStorage.maskPhone(currentThread.targetPhoneRaw),
          text: 'Siap kami proses Pak! Terima kasih sudah berbelanja di lapak warga.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          status: 'read',
        };
        await AppQuChatStorage.sendMessage(replyMsg);
      }, 1500);
    }
  };

  // Image Upload with Client-Side Compression (<100KB)
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showNotification('Mengompresi gambar client-side (<100 KB)...');
      const compressedDataUrl = await AppQuChatStorage.compressImage(file);
      setAttachedImage(compressedDataUrl);
      showNotification('Foto terkompresi hemat RAM & data (<100 KB)');
    } catch {
      showNotification('Gagal mengompresi gambar.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Web Speech API Voice Recognition (Smart Auto-Text)
  const handleToggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulation for unsupported browsers/emulators
      if (!isListeningSpeech) {
        setIsListeningSpeech(true);
        showNotification('Merekam suara... Mentranskripsikan ke teks.');
        setTimeout(() => {
          setIsListeningSpeech(false);
          const sampleTranscripts = [
            'Tolong segera merapat ke depan pos ronda gang 3.',
            'Pesanan sudah dibayar via QRIS mohon diantar.',
            'Kondisi jalan aman, portal sudah dikunci rapat.',
          ];
          const chosen = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
          setInputText((prev) => (prev ? `${prev} ${chosen}` : chosen));
          showNotification('Transkripsi suara selesai dimasukkan!');
        }, 2500);
      } else {
        setIsListeningSpeech(false);
      }
      return;
    }

    try {
      if (!isListeningSpeech) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListeningSpeech(true);
          showNotification('Mendengarkan suara... Silakan berbicara.');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          showNotification(`Transkrip: "${transcript}"`);
          setIsListeningSpeech(false);
        };

        recognition.onerror = () => {
          setIsListeningSpeech(false);
          showNotification('Gagal mendeteksi suara.');
        };

        recognition.onend = () => {
          setIsListeningSpeech(false);
        };

        recognition.start();
      }
    } catch (e) {
      setIsListeningSpeech(false);
    }
  };

  // Voice Note Recorder (15-30 seconds capped)
  const handleToggleVoiceRecord = async () => {
    if (isRecordingVoice) {
      // Stop recording and send voice note
      clearInterval(recordIntervalRef.current);
      setIsRecordingVoice(false);

      if (!selectedThreadId) return;

      const voiceMsg: ChatMessage = {
        id: `voice_${Date.now()}`,
        threadId: selectedThreadId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.roleTier,
        senderPhoneRaw: currentUser.phone,
        senderPhoneMasked: AppQuChatStorage.maskPhone(currentUser.phone || ''),
        text: `🎙️ Pesan Suara (${recordSeconds || 1}s)`,
        audioUrl: 'simulated_voice_blob',
        audioDurationSec: recordSeconds || 1,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        status: 'sent',
      };

      setRecordSeconds(0);
      setMessages((prev) => [...prev, voiceMsg]);
      scrollToBottom();
      await AppQuChatStorage.sendMessage(voiceMsg);
      showNotification(`Pesan suara (${voiceMsg.audioDurationSec}s) terkirim hemat memori (<100 KB).`);
    } else {
      // Start recording
      setIsRecordingVoice(true);
      setRecordSeconds(1);

      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 15) {
            // Auto-stop at 15 seconds to respect RAM 1 GB limit
            handleToggleVoiceRecord();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Mark transaction done & start auto-purge countdown
  const handleMarkTransactionDone = async () => {
    if (!selectedThreadId) return;
    const updated = await AppQuChatStorage.markTransactionDone(selectedThreadId);
    if (updated) {
      setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showNotification('Transaksi selesai. Obrolan akan auto-purge dalam 24 jam.');
    }
  };

  // Report user
  const handleReportUser = async () => {
    if (!currentThread) return;
    const res = await AppQuChatStorage.reportUser(
      currentThread.targetId || currentThread.id,
      currentThread.title,
      currentUser,
      reportReason
    );
    setIsReportModalOpen(false);

    if (res.isFrozen) {
      showNotification(`Akun ${currentThread.title} telah mencapai 3 laporan dan otomatis DIBEKUKAN.`);
    } else {
      showNotification(`Laporan berhasil disimpan (${res.totalReports}/3 laporan menuju pembekuan).`);
    }
    loadData();
  };

  // Open WhatsApp Official Fallback
  const handleOpenWhatsApp = () => {
    if (!currentThread?.targetPhoneRaw) return;
    const url = AppQuChatStorage.getWhatsAppDeepLink(
      currentThread.targetPhoneRaw,
      `Halo dari AppQu, perihal: ${currentThread.title}`
    );
    window.open(url, '_blank');
  };

  // Filtered threads by active tab
  const filteredThreads = threads.filter((t) => {
    if (activeTab === 'transaksi') return t.type === 'transaksi';
    if (activeTab === 'komunitas') return t.type === 'komunitas';
    if (activeTab === 'sos') return t.type === 'sos';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-stone-900 text-stone-100 relative overflow-hidden select-none font-sans">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & BARRIER NOTICES */}
      {/* ======================================================== */}
      <div className="bg-stone-950 border-b border-stone-800 px-3 py-2 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          {selectedThreadId ? (
            <button
              onClick={() => setSelectedThreadId(null)}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              title="Kembali ke Daftar Percakapan"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          )}
          <div>
            <h1 className="text-xs font-black tracking-tight flex items-center gap-1 text-white">
              <span>Modul Percakapan AppQu</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                RAM 1 GB • Rp 0
              </span>
            </h1>
            <p className="text-[10px] text-stone-400">
              Local-First IndexedDB • Relay Siaran Tanpa Server Cloud
            </p>
          </div>
        </div>

        {/* Global Action / Refresh */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={loadData}
            title="Sinkronisasi Pesan Lokal"
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN LAYOUT: THREAD LIST OR ACTIVE CHAT ROOM */}
      {/* ======================================================== */}
      {!selectedThreadId ? (
        // ------------------ THREAD LIST VIEW ------------------
        <div className="flex-1 flex flex-col overflow-hidden bg-stone-900">
          {/* Three Tab Buttons */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-stone-950/70 border-b border-stone-800/80">
            <button
              onClick={() => setActiveTab('transaksi')}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                activeTab === 'transaksi'
                  ? 'bg-amber-600 text-stone-950 shadow'
                  : 'bg-stone-800/60 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Transaksi</span>
              </div>
              <span className="text-[9px] opacity-80">Usaha & Kurir</span>
            </button>

            <button
              onClick={() => setActiveTab('komunitas')}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                activeTab === 'komunitas'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-stone-800/60 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Warga & RT</span>
              </div>
              <span className="text-[9px] opacity-80">Grup Lingkungan</span>
            </button>

            <button
              onClick={() => setActiveTab('sos')}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                activeTab === 'sos'
                  ? 'bg-red-700 text-white shadow'
                  : 'bg-stone-800/60 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Arsip SOS</span>
              </div>
              <span className="text-[9px] opacity-80">BAP & Darurat</span>
            </button>
          </div>

          {/* Subheader Notice based on active category */}
          <div className="px-3 py-1.5 bg-stone-950/40 text-[10px] text-stone-400 flex items-center justify-between border-b border-stone-800/50">
            {activeTab === 'transaksi' && (
              <span className="flex items-center gap-1 text-amber-300">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                Auto-Purge 24–48 jam aktif setelah transaksi selesai.
              </span>
            )}
            {activeTab === 'komunitas' && (
              <span className="flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                Khusus Warga Terverifikasi RT 04 (Chain of Trust).
              </span>
            )}
            {activeTab === 'sos' && (
              <span className="flex items-center gap-1 text-red-300">
                <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                Grup Ephemeral 72 Jam & Arsip BAP Permanen Offline.
              </span>
            )}
            <span className="text-[9px] text-stone-400">
              {filteredThreads.length} Ruang Obrolan
            </span>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60 p-2 space-y-1">
            {filteredThreads.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-stone-400" />
                <p className="text-xs">Belum ada obrolan dalam kategori ini.</p>
                <p className="text-[10px] mt-1 text-stone-400">
                  Semua riwayat disimpan hemat memori di HP lokal Anda.
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer active:scale-[0.99] border ${
                    thread.status === 'selesai'
                      ? 'bg-stone-900/60 border-stone-800/40 opacity-80'
                      : 'bg-stone-800/50 hover:bg-stone-800 border-stone-700/40 hover:border-emerald-500/30'
                  }`}
                >
                  {/* Avatar Initial / Emoji */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-inner ${thread.avatarColor} text-white`}
                  >
                    {thread.avatarText}
                  </div>

                  {/* Thread Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h2 className="text-xs font-bold text-stone-100 truncate">
                        {thread.title}
                      </h2>
                      <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                        {thread.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-[10px] text-stone-400 truncate mb-1">
                      {thread.subtitle}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-stone-300 truncate font-normal">
                        {thread.lastMessage}
                      </p>

                      {/* Unread or Status Badges */}
                      {thread.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-stone-950">
                          {thread.unreadCount}
                        </span>
                      )}

                      {thread.status === 'selesai' && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-stone-700 text-stone-300 border border-stone-600">
                          Selesai
                        </span>
                      )}

                      {thread.status === 'blocked' && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-950 text-red-400 border border-red-800">
                          Dibekukan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Special Section in SOS Tab: Permanent Offline BAP Archive List */}
            {activeTab === 'sos' && (
              <div className="mt-4 pt-3 border-t border-stone-800">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Arsip BAP Kepolisian (Offline Permanen)
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {sosHistoryList.length} Berkas
                  </span>
                </div>

                <div className="space-y-1.5">
                  {sosHistoryList.map((sosRec) => (
                    <div
                      key={sosRec.id}
                      onClick={() => setSelectedBAPRecord(sosRec)}
                      className="p-2.5 rounded-lg bg-stone-950/80 border border-amber-900/40 hover:border-amber-600/50 cursor-pointer flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-amber-200 truncate">
                            {sosRec.incidentType}
                          </span>
                          <span className="text-[9px] px-1 rounded bg-stone-800 text-stone-300">
                            {sosRec.rtRw}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 truncate">
                          Pelapor: {sosRec.reporterName} • {sosRec.timestamp}
                        </p>
                      </div>

                      <button className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 text-[10px] font-bold shrink-0 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        BAP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ------------------ ACTIVE CHAT ROOM VIEW ------------------
        <div className="flex-1 flex flex-col overflow-hidden bg-stone-950">
          {/* Chat Room Header */}
          <div className="px-3 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                  currentThread?.avatarColor || 'bg-emerald-700'
                } text-white`}
              >
                {currentThread?.avatarText || '💬'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold text-white truncate max-w-[150px] xs:max-w-[200px]">
                    {currentThread?.title}
                  </h2>
                  {currentThread?.status === 'selesai' && (
                    <span className="text-[9px] px-1 rounded bg-stone-800 text-stone-400 border border-stone-700">
                      Selesai
                    </span>
                  )}
                </div>

                {/* Masked Phone Number Display & Toggle */}
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <Phone className="w-2.5 h-2.5 text-stone-400" />
                  <span>
                    {maskPhoneState
                      ? AppQuChatStorage.maskPhone(currentThread?.targetPhoneRaw || '')
                      : currentThread?.targetPhoneRaw || '-'}
                  </span>
                  <button
                    onClick={() => setMaskPhoneState(!maskPhoneState)}
                    className="p-0.5 text-stone-400 hover:text-stone-200"
                    title={maskPhoneState ? 'Lihat Nomor Asli' : 'Samarkan Nomor HP'}
                  >
                    {maskPhoneState ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              {/* WhatsApp Fallback Link */}
              {currentThread?.targetPhoneRaw && (
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                  title="Pindah ke WhatsApp Resmi"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden xs:inline">WhatsApp</span>
                </button>
              )}

              {/* Mark Done for Transaction */}
              {currentThread?.type === 'transaksi' && currentThread.status !== 'selesai' && (
                <button
                  onClick={handleMarkTransactionDone}
                  className="px-2 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Tandai Selesai & Aktifkan Auto-Purge"
                >
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  <span className="hidden xs:inline">Selesai</span>
                </button>
              )}

              {/* Block & Report Button */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 border border-stone-700/50 transition-colors"
                title="Laporkan / Blokir Pengguna"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subheader: Auto-Purge or Ephemeral Timer Info */}
          {currentThread?.type === 'transaksi' && currentThread.status === 'selesai' && (
            <div className="bg-amber-950/80 border-b border-amber-900/60 px-3 py-1 text-[10px] text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Auto-Purge Aktif: Riwayat obrolan ini akan terhapus otomatis dari HP dalam 24 jam.
              </span>
            </div>
          )}

          {currentThread?.type === 'sos' && (
            <div className="bg-red-950/80 border-b border-red-900/80 px-3 py-1.5 text-[10px] text-red-200 flex items-center justify-between">
              <span className="flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                Ephemeral SOS Group: Auto-escalate & Purge server dalam 72 jam.
              </span>
              <button
                onClick={() => {
                  const bRec = sosHistoryList.find((s) => s.threadId === currentThread.id);
                  if (bRec) setSelectedBAPRecord(bRec);
                }}
                className="px-2 py-0.5 rounded bg-red-800 text-white font-bold text-[9px] hover:bg-red-700"
              >
                Format BAP ➔
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-stone-900/40">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                Mulai percakapan santun di lingkungan warga.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.isMe;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
                  >
                    {/* Sender Label for Group Chats */}
                    {!isMe && (
                      <span className="text-[10px] text-stone-400 font-bold mb-0.5 ml-1 flex items-center gap-1">
                        {msg.senderName}
                        {msg.senderRole && (
                          <span className="text-[9px] font-normal text-emerald-400">
                            ({msg.senderRole})
                          </span>
                        )}
                      </span>
                    )}

                    {/* Chat Bubble */}
                    <div
                      className={`relative px-3 py-2 rounded-2xl max-w-[85%] text-xs shadow-sm break-words ${
                        isMe
                          ? 'bg-emerald-700 text-white rounded-tr-xs'
                          : msg.senderId === 'system'
                          ? 'bg-stone-800 text-amber-300 border border-amber-900/50 rounded-lg text-center mx-auto'
                          : 'bg-stone-800 text-stone-100 rounded-tl-xs border border-stone-700/50'
                      }`}
                    >
                      {/* Attached Compressed Image (<100KB) */}
                      {msg.imageUrl && (
                        <div
                          onClick={() => setSelectedImageModal(msg.imageUrl || null)}
                          className="mb-1.5 rounded-lg overflow-hidden border border-black/30 cursor-pointer max-w-[200px]"
                        >
                          <img
                            src={msg.imageUrl}
                            alt="Lampiran (<100KB)"
                            className="w-full h-auto object-cover max-h-48"
                            loading="lazy"
                          />
                          <div className="bg-black/60 px-1 py-0.5 text-[9px] text-emerald-300 flex items-center justify-between">
                            <span>Foto Terkompresi</span>
                            <span>&lt;100 KB</span>
                          </div>
                        </div>
                      )}

                      {/* Voice Note Audio Player */}
                      {msg.audioUrl && (
                        <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-black/20 my-1">
                          <button
                            onClick={() =>
                              showNotification(`Memutar pesan suara (${msg.audioDurationSec} detik)...`)
                            }
                            className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex-1">
                            <div className="h-1 bg-stone-600 rounded-full w-24 overflow-hidden">
                              <div className="h-full bg-emerald-400 w-2/3"></div>
                            </div>
                            <span className="text-[9px] text-stone-300 mt-0.5 block">
                              0:0{msg.audioDurationSec || 15} • Suara Ringkas
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Smart Auto-Text Transcript Badge */}
                      {msg.isSpeechTranscript && (
                        <div className="flex items-center gap-1 text-[9px] text-amber-300 mb-1 font-semibold">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Smart Auto-Text (Web Speech API)</span>
                        </div>
                      )}

                      {/* Text Body */}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* Time & Delivery Status */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3 h-3 text-sky-300" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3 h-3 text-stone-300" />
                            ) : (
                              <Check className="w-3 h-3 text-stone-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips Bar (Fast 1-tap typing for low spec devices) */}
          <div className="bg-stone-950 border-t border-stone-800/80 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickReplies[currentThread?.type || 'transaksi'].map((qr, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qr)}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[10px] font-medium shrink-0 border border-stone-700/60 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input & Media Bar */}
          <div className="bg-stone-900 border-t border-stone-800 px-2.5 py-2 shrink-0">
            {/* Image Preview if attached */}
            {attachedImage && (
              <div className="mb-2 p-1.5 bg-stone-950 rounded-lg flex items-center justify-between border border-stone-700 max-w-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={attachedImage}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-300 block">
                      Foto Terkompresi
                    </span>
                    <span className="text-[9px] text-stone-400">&lt; 100 KB WebP/JPEG</span>
                  </div>
                </div>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="p-1 text-stone-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              {/* Camera / Photo Compressor Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
                title="Kirim Foto (Auto-Compress <100 KB)"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Web Speech API Live Auto-Text */}
              <button
                type="button"
                onClick={handleToggleSpeechRecognition}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListeningSpeech
                    ? 'bg-amber-500 text-stone-950 animate-pulse'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-amber-300'
                }`}
                title="Bicara ke Teks (Web Speech API)"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Voice Note Recorder Button */}
              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  isRecordingVoice
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-red-400'
                }`}
                title="Rekam Voice Note (Maks 15-30 Detik)"
              >
                {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecordingVoice && (
                  <span className="text-[10px] font-bold">{recordSeconds}s</span>
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={
                  isRecordingVoice
                    ? 'Sedang merekam suara...'
                    : isListeningSpeech
                    ? 'Mendengarkan ucapan...'
                    : 'Ketik pesan ramah warga...'
                }
                disabled={isRecordingVoice}
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !attachedImage) || isRecordingVoice}
                className={`p-2 rounded-xl transition-transform active:scale-95 cursor-pointer ${
                  inputText.trim() || attachedImage
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    : 'bg-stone-800 text-stone-400 cursor-not-allowed'
                }`}
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MODAL: REPORT & BLOCK USER (3 Laporan = Freeze) */}
      {/* ======================================================== */}
      {isReportModalOpen && currentThread && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-sm p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-800">
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-bold">Laporkan & Blokir Pengguna</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-stone-300 mb-2">
              Anda akan melaporkan kontak <strong className="text-white">{currentThread.title}</strong>.
              Sesuai konstitusi moderasi AppQu, akun yang menerima <strong>3 laporan warga</strong>{' '}
              otomatis dibekukan akses obrolannya demi ketertiban lingkungan.
            </p>

            <label className="text-[10px] text-stone-400 font-bold block mb-1">
              Alasan Laporan:
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 mb-4 focus:outline-none focus:border-red-500"
            >
              <option value="Spam atau pesan mencurigakan">Spam atau pesan mencurigakan</option>
              <option value="Konten provokatif / politik terlarang">
                Konten provokatif / politik terlarang
              </option>
              <option value="Pelecehan / kata-kata kasar">Pelecehan / kata-kata kasar</option>
              <option value="Penipuan transaksi dagang / COD">
                Penipuan transaksi dagang / COD
              </option>
              <option value="Identitas palsu di luar RT 04">Identitas palsu di luar RT 04</option>
            </select>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleReportUser}
                className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold shadow-md"
              >
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL: SOS BAP OFFICIAL POLICE EVIDENCE PREVIEW */}
      {/* ======================================================== */}
      {selectedBAPRecord && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3">
          <div className="bg-stone-900 border border-amber-600/50 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-1.5 text-amber-300">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-bold">Format Berita Acara (BAP) Kepolisian</h3>
              </div>
              <button
                onClick={() => setSelectedBAPRecord(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-stone-950 p-3 rounded-xl border border-stone-800 text-[11px] font-mono leading-relaxed text-stone-300 whitespace-pre-wrap select-text">
              {selectedBAPRecord.bapDocumentText}
            </div>

            <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-stone-400">
                Tersimpan Offline di HP (IndexedDB)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedBAPRecord.bapDocumentText);
                    showNotification('Teks Berita Acara BAP disalin ke clipboard.');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
                >
                  Salin Teks
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([selectedBAPRecord.bapDocumentText], {
                      type: 'text/plain;charset=utf-8',
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `BAP_SOS_${selectedBAPRecord.id}.txt`;
                    link.click();
                    showNotification('Berkas BAP berhasil diunduh.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh .TXT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODAL: IMAGE FULLSCREEN PREVIEW */}
      {/* ======================================================== */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 cursor-pointer"
        >
          <div className="max-w-md max-h-[90vh] relative">
            <img
              src={selectedImageModal}
              alt="Foto Diperbesar"
              className="w-full h-auto max-h-[80vh] rounded-xl object-contain shadow-2xl"
            />
            <div className="text-center mt-2 text-[10px] text-stone-400">
              Ketuk di mana saja untuk menutup • Ukuran &lt; 100 KB
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
