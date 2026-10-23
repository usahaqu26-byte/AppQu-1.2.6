import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  Wallet,
  FileCheck,
  Pin,
  Heart,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Send,
  Upload,
  ScanLine,
  Check,
  X,
  QrCode,
  Users,
  ShieldCheck,
  FileText,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

import {
  UserProfile,
  FeedPost,
  AgendaEvent,
  KasTransaction,
  SuratPengantar,
  PollOption,
} from '../../types';

interface PaguyubanViewProps {
  currentUser: UserProfile;
  feeds: FeedPost[];
  agenda: AgendaEvent[];
  kas: KasTransaction[];
  letters: SuratPengantar[];
  onUpdateFeeds: (feeds: FeedPost[]) => void;
  onUpdateAgenda: (agenda: AgendaEvent[]) => void;
  onUpdateKas: (kas: KasTransaction[]) => void;
  onUpdateLetters: (letters: SuratPengantar[]) => void;
  showNotification: (msg: string) => void;
}

export const PaguyubanView: React.FC<PaguyubanViewProps> = ({
  currentUser,
  feeds,
  agenda,
  kas,
  letters,
  onUpdateFeeds,
  onUpdateAgenda,
  onUpdateKas,
  onUpdateLetters,
  showNotification,
}) => {
  const [subTab, setSubTab] = useState<'feed' | 'agenda' | 'kas' | 'admin'>('feed');

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'pengumuman' | 'diskusi' | 'polling'>('diskusi');

  // OCR Modal for Kas Payment
  const [isPayDuesModalOpen, setIsPayDuesModalOpen] = useState(false);
  const [ocrStep, setOcrStep] = useState<'upload' | 'scanning' | 'success'>('upload');
  const [simulatedOcrData, setSimulatedOcrData] = useState<any>(null);

  // Letter Request Modal
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [letterType, setLetterType] = useState<SuratPengantar['type']>('skck');
  const [letterPurpose, setLetterPurpose] = useState('');

  // Selected Letter for View / Approval
  const [selectedLetter, setSelectedLetter] = useState<SuratPengantar | null>(null);

  // QR Presensi Modal
  const [qrPresensiEvent, setQrPresensiEvent] = useState<AgendaEvent | null>(null);

  // Is Current User a Reviewer / Approver?
  const isApprover =
    currentUser.roleTier === 'pengurus' ||
    currentUser.roleTier === 'governance' ||
    currentUser.roleDetail === 'ketua_rt' ||
    currentUser.roleDetail === 'sekretaris';

  const isTreasurer =
    currentUser.roleDetail === 'bendahara' ||
    currentUser.roleDetail === 'ketua_rt' ||
    currentUser.roleTier === 'governance';

  // ----------------------------------------------------
  // FEED HANDLERS
  // ----------------------------------------------------
  const handleLikePost = (postId: string) => {
    const updated = feeds.map((f) => {
      if (f.id === postId) {
        const hasLiked = f.hasLiked;
        return {
          ...f,
          likes: hasLiked ? f.likes - 1 : f.likes + 1,
          hasLiked: !hasLiked,
        };
      }
      return f;
    });
    onUpdateFeeds(updated);
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    const updated = feeds.map((f) => {
      if (f.id === postId && f.pollData) {
        const prevVote = f.pollData.userVotedOptionId;
        const newOptions = f.pollData.options.map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          if (prevVote && opt.id === prevVote) {
            return { ...opt, votes: Math.max(0, opt.votes - 1) };
          }
          return opt;
        });

        const newTotal = prevVote ? f.pollData.totalVotes : f.pollData.totalVotes + 1;

        return {
          ...f,
          pollData: {
            ...f.pollData,
            options: newOptions,
            userVotedOptionId: optionId,
            totalVotes: newTotal,
          },
        };
      }
      return f;
    });
    onUpdateFeeds(updated);
    showNotification('Suara Anda pada polling telah tercatat.');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: FeedPost = {
      id: `feed-${Date.now()}`,
      authorId: currentUser.id,
      authorName: `${currentUser.name} (${currentUser.blockNumber})`,
      authorRole: currentUser.roleTitle,
      postType: newPostType,
      title: newPostTitle,
      content: newPostContent,
      isPinned: newPostType === 'pengumuman' && currentUser.roleTier === 'pengurus',
      createdAt: new Date().toISOString(),
      likes: 0,
      commentsCount: 0,
      pollData:
        newPostType === 'polling'
          ? {
              question: newPostTitle,
              options: [
                { id: 'opt-1', text: 'Setuju Sepenuhnya', votes: 1 },
                { id: 'opt-2', text: 'Perlu Pengkajian Ulang', votes: 0 },
                { id: 'opt-3', text: 'Tidak Setuju', votes: 0 },
              ],
              userVotedOptionId: 'opt-1',
              totalVotes: 1,
            }
          : undefined,
    };

    onUpdateFeeds([newPost, ...feeds]);
    setNewPostTitle('');
    setNewPostContent('');
    setIsPostModalOpen(false);
    showNotification('Postingan berhasil dipublikasikan ke Feed Warga.');
  };

  // ----------------------------------------------------
  // AGENDA HANDLERS
  // ----------------------------------------------------
  const handleRsvp = (eventId: string, rsvpType: 'hadir' | 'tidak') => {
    const updated = agenda.map((ev) => {
      if (ev.id === eventId) {
        const prev = ev.userRsvp;
        let hadir = ev.rsvpCount.hadir;
        let tidak = ev.rsvpCount.tidak;

        if (prev === 'hadir') hadir = Math.max(0, hadir - 1);
        if (prev === 'tidak') tidak = Math.max(0, tidak - 1);

        if (rsvpType === 'hadir') hadir += 1;
        if (rsvpType === 'tidak') tidak += 1;

        return {
          ...ev,
          userRsvp: rsvpType,
          rsvpCount: { hadir, tidak },
        };
      }
      return ev;
    });
    onUpdateAgenda(updated);
    showNotification(`Konfirmasi kehadiran berhasil dicatat (${rsvpType === 'hadir' ? 'Hadir' : 'Absen'}).`);
  };

  // ----------------------------------------------------
  // KAS & OCR HANDLERS
  // ----------------------------------------------------
  const handleSimulateOcr = () => {
    setOcrStep('scanning');
    setTimeout(() => {
      setSimulatedOcrData({
        bank: 'BCA Mobile / QRIS',
        sender: currentUser.name.toUpperCase(),
        amount: 50000,
        transactionTime: new Date().toLocaleString('id-ID'),
        matchScore: 99.8,
        destinationAccount: 'KAS PAGUYUBAN RT 04 (BCA 8830-192-111)',
      });
      setOcrStep('success');
    }, 1200);
  };

  const handleConfirmDuesPayment = () => {
    const newTx: KasTransaction = {
      id: `kas-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      blockNumber: currentUser.blockNumber,
      type: 'iuran',
      title: 'Iuran Warga Periode Berjalan',
      amount: 50000,
      date: new Date().toISOString().split('T')[0],
      status: 'verified', // Instant OCR verification
      category: 'Iuran Bulanan',
      ocrData: simulatedOcrData,
    };

    onUpdateKas([newTx, ...kas]);
    setIsPayDuesModalOpen(false);
    setOcrStep('upload');
    setSimulatedOcrData(null);
    showNotification('Pembayaran Iuran berhasil diverifikasi otomatis oleh Smart OCR Kas!');
  };

  const handleApproveKasTransaction = (txId: string) => {
    const updated = kas.map((k) => (k.id === txId ? { ...k, status: 'verified' as const } : k));
    onUpdateKas(updated);
    showNotification('Transaksi Kas warga berhasil disetujui.');
  };

  // ----------------------------------------------------
  // LETTERS (SURAT PENGANTAR DIGITAL) HANDLERS
  // ----------------------------------------------------
  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterPurpose.trim()) return;

    const date = new Date();
    const count = letters.length + 1;
    const letterNum = `${String(count).padStart(2, '0')}/SP-RT04/${date.toLocaleString('default', { month: 'short' }).toUpperCase()}/${date.getFullYear()}`;

    const newLetter: SuratPengantar = {
      id: `surat-${Date.now()}`,
      letterNumber: letterNum,
      userId: currentUser.id,
      userName: currentUser.name,
      nik: currentUser.nik,
      noKk: currentUser.noKk,
      blockNumber: currentUser.blockNumber,
      type: letterType,
      purpose: letterPurpose,
      status: 'pending_sekretaris',
      createdAt: date.toISOString(),
    };

    onUpdateLetters([newLetter, ...letters]);
    setLetterPurpose('');
    setIsLetterModalOpen(false);
    showNotification('Permohonan Surat Pengantar terkirim ke Sekretaris RT.');
  };

  const handleApproveLetter = (letterId: string) => {
    const updated = letters.map((l) => {
      if (l.id === letterId) {
        return {
          ...l,
          status: 'approved' as const,
          approvedAt: new Date().toISOString(),
          approvedBy: `${currentUser.name} (${currentUser.roleTitle})`,
          digitalSignatureQr: `VERIFIED-RT04-${l.letterNumber}-${l.userName}`,
        };
      }
      return l;
    });
    onUpdateLetters(updated);
    if (selectedLetter && selectedLetter.id === letterId) {
      setSelectedLetter({
        ...selectedLetter,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: `${currentUser.name} (${currentUser.roleTitle})`,
        digitalSignatureQr: `VERIFIED-RT04-${selectedLetter.letterNumber}-${selectedLetter.userName}`,
      });
    }
    showNotification('Surat Pengantar Digital telah disetujui & Tanda Tangan QR diterbitkan!');
  };

  const handleRejectLetter = (letterId: string) => {
    const updated = letters.map((l) => (l.id === letterId ? { ...l, status: 'rejected' as const } : l));
    onUpdateLetters(updated);
    if (selectedLetter && selectedLetter.id === letterId) {
      setSelectedLetter({ ...selectedLetter, status: 'rejected' });
    }
    showNotification('Surat Pengantar ditolak.');
  };

  // Kas Balances Calculation
  const totalPemasukan = kas
    .filter((k) => k.status === 'verified' && (k.type === 'iuran' || k.type === 'donasi_duka'))
    .reduce((sum, k) => sum + k.amount, 0);

  const totalPengeluaran = kas
    .filter((k) => k.status === 'verified' && k.type === 'pengeluaran')
    .reduce((sum, k) => sum + k.amount, 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const myDuesPaid = kas.some(
    (k) => k.userId === currentUser.id && k.status === 'verified' && k.type === 'iuran'
  );

  return (
    <div className="flex-1 flex flex-col bg-stone-100 overflow-hidden">
      {/* Sub Tab Navigation */}
      <div className="bg-white border-b border-stone-200 px-3 py-2 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSubTab('feed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subTab === 'feed'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feed Warga</span>
          </button>

          <button
            onClick={() => setSubTab('agenda')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subTab === 'agenda'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agenda & Kegiatan</span>
          </button>

          <button
            onClick={() => setSubTab('kas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subTab === 'kas'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Kas & Keuangan</span>
          </button>

          <button
            onClick={() => setSubTab('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subTab === 'admin'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Surat Pengantar</span>
            {letters.filter((l) => l.status.startsWith('pending')).length > 0 && isApprover && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* ========================================================= */}
        {/* TAB 1: FEED WARGA */}
        {/* ========================================================= */}
        {subTab === 'feed' && (
          <div className="space-y-3">
            {/* Quick Share Bar */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-emerald-300">
                {currentUser.name.charAt(0)}
              </div>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 bg-stone-100 hover:bg-stone-200/80 text-stone-500 text-left px-3.5 py-2 rounded-xl text-xs transition-colors"
              >
                Tulis pengumuman, polling, atau ide warga...
              </button>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Feeds Stream */}
            {feeds.map((post) => (
              <div
                key={post.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs space-y-2.5 transition-all ${
                  post.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200/80'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-900 leading-tight">
                          {post.authorName}
                        </span>
                        {post.isPinned && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                        <span>{post.authorRole}</span>
                        <span>·</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      post.postType === 'pengumuman'
                        ? 'bg-red-100 text-red-700'
                        : post.postType === 'polling'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {post.postType.toUpperCase()}
                  </span>
                </div>

                {/* Body Title & Text */}
                <h3 className="text-xs font-bold text-stone-900 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Interactive Polling Section */}
                {post.pollData && (
                  <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-stone-800">
                      {post.pollData.question}
                    </div>

                    <div className="space-y-1.5">
                      {post.pollData.options.map((opt) => {
                        const total = post.pollData?.totalVotes || 1;
                        const pct = Math.round((opt.votes / total) * 100);
                        const isVoted = post.pollData?.userVotedOptionId === opt.id;

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleVotePoll(post.id, opt.id)}
                            className={`w-full text-left p-2 rounded-lg text-xs relative overflow-hidden border transition-all ${
                              isVoted
                                ? 'border-teal-500 bg-teal-50 font-semibold text-teal-900'
                                : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                            }`}
                          >
                            {/* Vote Progress Bar */}
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-teal-200/40 transition-all duration-300 pointer-events-none"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between text-xs z-10">
                              <div className="flex items-center gap-1.5">
                                {isVoted && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                                <span>{opt.text}</span>
                              </div>
                              <span className="font-mono text-[11px] text-stone-500 font-bold">
                                {pct}% ({opt.votes})
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-stone-400 text-right">
                      Total Partisipasi: {post.pollData.totalVotes} suara warga
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.hasLiked ? 'text-red-600 font-bold' : 'hover:text-stone-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.hasLiked ? 'fill-red-600' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                      <span>{post.commentsCount} Komentar</span>
                    </div>
                  </div>

                  <button
                    onClick={() => showNotification('Tautan postingan disalin.')}
                    className="hover:text-stone-800"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AGENDA & KEGIATAN */}
        {/* ========================================================= */}
        {subTab === 'agenda' && (
          <div className="space-y-3">
            <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-sm space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Kalender Komunitas RT 04
              </span>
              <h2 className="text-sm font-bold">Agenda & Gotong Royong Warga</h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Konfirmasikan kehadiran Anda (RSVP) dan lakukan presensi QR saat kegiatan berlangsung.
              </p>
            </div>

            {agenda.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {ev.date}
                    </span>
                    <h3 className="text-xs font-bold text-stone-900 mt-1">{ev.title}</h3>
                  </div>

                  {ev.presensiCode && (
                    <button
                      onClick={() => setQrPresensiEvent(ev)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                      <span>QR Presensi</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>{ev.location}</span>
                  </div>
                  <p className="text-xs text-stone-600 pt-1 leading-relaxed">{ev.description}</p>
                </div>

                {/* RSVP Controls */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500">
                    <span className="font-bold text-emerald-700">{ev.rsvpCount.hadir} Hadir</span> ·{' '}
                    <span>{ev.rsvpCount.tidak} Berhalangan</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRsvp(ev.id, 'hadir')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ev.userRsvp === 'hadir'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      Hadir
                    </button>
                    <button
                      onClick={() => handleRsvp(ev.id, 'tidak')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        ev.userRsvp === 'tidak'
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      Absen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: KAS & KEUANGAN */}
        {/* ========================================================= */}
        {subTab === 'kas' && (
          <div className="space-y-3.5">
            {/* Saldo Kas Banner */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  Transparansi Finansial Kas RT 04
                </span>
                <span className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full text-emerald-200 font-mono">
                  Real-Time Verified
                </span>
              </div>

              <div>
                <div className="text-[11px] text-emerald-200/90">Total Saldo Kas Bersih</div>
                <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                  Rp {saldoKas.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] text-emerald-200">Total Masuk</div>
                    <div className="text-xs font-bold text-white font-mono">
                      Rp {totalPemasukan.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-300">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] text-emerald-200">Total Keluar</div>
                    <div className="text-xs font-bold text-white font-mono">
                      Rp {totalPengeluaran.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Iuran Saya */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-stone-500">Status Iuran Bulanan Saya (Okt 2026)</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {myDuesPaid ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Lunas Terverifikasi
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Belum Terbayar (Rp 50.000)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsPayDuesModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <ScanLine className="w-3.5 h-3.5 text-amber-300" />
                <span>Smart Scan OCR</span>
              </button>
            </div>

            {/* Riwayat Mutasi Kas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-stone-800">Buku Mutasi Kas RT Terkini</span>
                <span className="text-[10px] text-stone-400">Semua Warga Dapat Melihat</span>
              </div>

              {kas.map((item) => {
                const isIncome = item.type === 'iuran' || item.type === 'donasi_duka';
                const isPending = item.status === 'pending';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-3 border border-stone-200/70 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {item.userName} · {item.date}
                        </div>
                        {item.ocrData && (
                          <div className="text-[9px] text-teal-700 font-medium">
                            OCR match {item.ocrData.matchScore}% via {item.ocrData.bank}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-bold font-mono ${
                          isIncome ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                      </div>

                      {isPending ? (
                        isTreasurer ? (
                          <button
                            onClick={() => handleApproveKasTransaction(item.id)}
                            className="mt-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[9px] rounded-md"
                          >
                            Validasi
                          </button>
                        ) : (
                          <span className="text-[9px] text-amber-600 font-medium">
                            Menunggu Verifikasi
                          </span>
                        )
                      ) : (
                        <span className="text-[9px] text-stone-400">Tercatat</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ADMINISTRASI & SURAT PENGANTAR DIGITAL */}
        {/* ========================================================= */}
        {subTab === 'admin' && (
          <div className="space-y-3.5">
            {/* Header / Action Bar */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900">Surat Pengantar RT Digital</h3>
                  <p className="text-[11px] text-stone-500">
                    Auto-Fill NIK, KK, & Alamat. Tanda Tangan QR Resmi Pengurus RT.
                  </p>
                </div>
                <button
                  onClick={() => setIsLetterModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Surat</span>
                </button>
              </div>

              {/* Approval Counter for Pengurus */}
              {isApprover && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>
                      Mode Pengurus:{' '}
                      <strong className="font-semibold">
                        {letters.filter((l) => l.status.startsWith('pending')).length} Permohonan
                      </strong>{' '}
                      menunggu approval Anda.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* List of Letters */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800 px-1">Daftar Pengajuan Surat</div>

              {letters.map((letItem) => {
                const isPending = letItem.status.startsWith('pending');
                const isApproved = letItem.status === 'approved';

                return (
                  <div
                    key={letItem.id}
                    onClick={() => setSelectedLetter(letItem)}
                    className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:border-emerald-300 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-stone-500">
                          {letItem.letterNumber}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 capitalize mt-0.5">
                          Surat Pengantar {letItem.type.replace('_', ' ').toUpperCase()}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isApproved ? 'Disetujui' : isPending ? 'Menunggu Approval' : 'Ditolak'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2">{letItem.purpose}</p>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                      <span>Pemohon: {letItem.userName}</span>
                      <span className="text-emerald-700 font-semibold">Lihat Detail ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: WRITE NEW POST */}
      {/* ---------------------------------------------------- */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-stone-900">Buat Postingan Feed Warga</h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700">Tipe Postingan</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {(['diskusi', 'polling', 'pengumuman'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setNewPostType(t)}
                      className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        newPostType === t
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700">Judul</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Contoh: Usulan Pemilahan Sampah Organik..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700">Isi Pesan / Informasi</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={3}
                  placeholder="Tuliskan uraian detail agar mudah dipahami tetangga..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Publikasikan Sekarang</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: SMART SCAN OCR BUKTI TRANSFER KAS */}
      {/* ---------------------------------------------------- */}
      {isPayDuesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-900">
                  Smart OCR Verifikasi Iuran Kas
                </h3>
              </div>
              <button
                onClick={() => setIsPayDuesModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Nama Warga:</span>
                <span className="font-bold text-stone-900">{currentUser.name}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Unit Blok:</span>
                <span className="font-bold text-stone-900">{currentUser.blockNumber}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Besaran Iuran:</span>
                <span className="font-bold text-emerald-800">Rp 50.000 / Bulan</span>
              </div>
            </div>

            {ocrStep === 'upload' && (
              <div className="space-y-3 text-center">
                <div
                  onClick={handleSimulateOcr}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 p-6 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-900">
                      Upload atau Scan Struk Transfer Bank
                    </span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      BCA, Mandiri, BRI, BNI, GoPay, OVO, atau QRIS Kas RT
                    </p>
                  </div>
                  <span className="mt-2 px-3 py-1 bg-emerald-800 text-white rounded-lg text-[10px] font-bold shadow-xs">
                    Klik untuk Simulasikan Scan OCR Cerdas
                  </span>
                </div>
              </div>
            )}

            {ocrStep === 'scanning' && (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-800 border-t-transparent animate-spin mx-auto"></div>
                <div className="text-xs font-bold text-stone-800">
                  AI OCR Membaca Karakter Struk & Rekening...
                </div>
                <p className="text-[10px] text-stone-500">
                  Memvalidasi kecocokan nama pengirim, nominal Rp 50.000, dan timestamp mutasi.
                </p>
              </div>
            )}

            {ocrStep === 'success' && simulatedOcrData && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Hasil Ekstraksi OCR Berhasil (Match Score 99.8%)</span>
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-0.5 pt-1 border-t border-emerald-200/60">
                    <div>Bank: {simulatedOcrData.bank}</div>
                    <div>Pengirim: {simulatedOcrData.sender}</div>
                    <div>Nominal: Rp {simulatedOcrData.amount.toLocaleString('id-ID')}</div>
                    <div>Waktu: {simulatedOcrData.transactionTime}</div>
                    <div>Tujuan: {simulatedOcrData.destinationAccount}</div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmDuesPayment}
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Konfirmasi & Simpan ke Mutasi Kas
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: AJUKAN SURAT PENGANTAR DIGITAL */}
      {/* ---------------------------------------------------- */}
      {isLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-stone-900">
                Permohonan Surat Pengantar Digital
              </h3>
              <button
                onClick={() => setIsLetterModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-fill Notice */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-0.5">
              <div className="font-bold text-stone-800">Auto-Fill Identitas WargaQu:</div>
              <div>NIK: {currentUser.nik}</div>
              <div>No. KK: {currentUser.noKk}</div>
              <div>Nama: {currentUser.name} ({currentUser.blockNumber})</div>
            </div>

            <form onSubmit={handleCreateLetter} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700">Keperluan Jenis Surat</label>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                >
                  <option value="skck">Pengantar SKCK Polsek</option>
                  <option value="ktp_baru">Pengantar KTP-el / Pindah Datang</option>
                  <option value="domisili">Surat Keterangan Domisili</option>
                  <option value="izin_usaha">Pengantar Izin Usaha Mikro (NIB OSS)</option>
                  <option value="kematian">Surat Keterangan Kematian</option>
                  <option value="nikah">Pengantar Nikah (N1-N4)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700">Tujuan & Keterangan Tambahan</label>
                <textarea
                  value={letterPurpose}
                  onChange={(e) => setLetterPurpose(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Pengurusan berkas kenaikan jenjang karir di instansi..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                Ajukan ke Pengurus RT
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: DETAIL & APPROVAL SURAT PENGANTAR */}
      {/* ---------------------------------------------------- */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-[10px] font-mono text-stone-500 font-bold">
                {selectedLetter.letterNumber}
              </span>
              <button
                onClick={() => setSelectedLetter(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Letter Layout Mock */}
            <div className="border-2 border-stone-800 p-4 rounded-xl text-stone-900 space-y-3 font-serif bg-stone-50/50">
              <div className="text-center border-b-2 border-stone-800 pb-2">
                <div className="text-xs font-bold tracking-wider uppercase">
                  Rukun Tetangga 04 / Rukun Warga 09
                </div>
                <div className="text-[10px] uppercase">
                  Kelurahan Sukamaju · Kecamatan Mandiri Bersama
                </div>
                <div className="text-xs font-bold underline mt-1">SURAT PENGANTAR KETUA RT</div>
                <div className="text-[10px] font-mono">No: {selectedLetter.letterNumber}</div>
              </div>

              <div className="text-[11px] space-y-1 font-sans">
                <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
                <div className="pl-2 space-y-0.5 text-stone-700">
                  <div><strong>Nama:</strong> {selectedLetter.userName}</div>
                  <div><strong>NIK:</strong> {selectedLetter.nik}</div>
                  <div><strong>No. KK:</strong> {selectedLetter.noKk}</div>
                  <div><strong>Alamat:</strong> {selectedLetter.blockNumber}, RT 04 / RW 09</div>
                </div>
                <p className="pt-1">
                  Orang tersebut di atas adalah benar warga kami dan surat ini diberikan untuk keperluan:
                </p>
                <p className="font-semibold text-stone-800 italic">"{selectedLetter.purpose}"</p>
              </div>

              {/* Approval Signature QR */}
              {selectedLetter.status === 'approved' && (
                <div className="pt-2 border-t border-stone-300 flex items-center justify-between font-sans">
                  <div>
                    <div className="text-[9px] text-stone-500">Diverifikasi & Disetujui oleh:</div>
                    <div className="text-[11px] font-bold text-emerald-800">
                      {selectedLetter.approvedBy || 'Ketua RT 04'}
                    </div>
                    <div className="text-[9px] text-stone-400">
                      {new Date(selectedLetter.approvedAt || '').toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="w-14 h-14 bg-white border border-stone-300 rounded p-1 flex flex-col items-center justify-center">
                    <QrCode className="w-10 h-10 text-emerald-900" />
                    <span className="text-[7px] font-mono font-bold text-emerald-800">VERIFIED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Approver Action Buttons */}
            {isApprover && selectedLetter.status !== 'approved' && (
              <div className="space-y-2 pt-1 font-sans">
                <div className="text-xs font-bold text-stone-800">Tindakan Validasi Pengurus:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApproveLetter(selectedLetter.id)}
                    className="py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Terbitkan QR</span>
                  </button>
                  <button
                    onClick={() => handleRejectLetter(selectedLetter.id)}
                    className="py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    <span>Tolak Pengajuan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: QR PRESENSI EVENT */}
      {/* ---------------------------------------------------- */}
      {qrPresensiEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 text-center space-y-3 animate-in fade-in zoom-in-95">
            <h3 className="text-xs font-bold text-stone-900">{qrPresensiEvent.title}</h3>
            <div className="w-48 h-48 bg-stone-50 border-2 border-emerald-600 rounded-2xl mx-auto flex flex-col items-center justify-center p-3">
              <QrCode className="w-36 h-36 text-emerald-900" />
              <span className="text-[10px] font-mono font-bold text-emerald-800 mt-1">
                {qrPresensiEvent.presensiCode}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Arahkan kamera warga ke QR Code ini saat tiba di lokasi untuk mencatat kehadiran resmi.
            </p>
            <button
              onClick={() => setQrPresensiEvent(null)}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
