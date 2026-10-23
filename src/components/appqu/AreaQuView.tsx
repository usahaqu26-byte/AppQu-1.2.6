import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  ExternalLink,
  Store,
  Bike,
  Shield,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  AlertCircle,
  Info,
  DollarSign,
  ChevronRight,
  Radio,
  X,
  MessageSquare,
  Locate,
  LocateFixed,
  List,
  Map as MapIcon,
  RefreshCw,
  Navigation2,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { AreaPoint, TransportasiCourier, UserProfile } from '../../types';
import { AppQuStorageService } from '../../services/storageAppQu';

interface AreaQuViewProps {
  currentUser: UserProfile;
  areaPoints?: AreaPoint[];
  couriers?: TransportasiCourier[];
  onOpenUsaha?: () => void;
  onOpenChat?: (threadId?: string) => void;
  showNotification: (msg: string) => void;
  // External filter and modal props from AppQuHeader
  selectedRadiusMeters?: number;
  onSelectRadius?: (radius: number) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  isRentalModalOpen?: boolean;
  onCloseRentalModal?: () => void;
  isNeutralityModalOpen?: boolean;
  onCloseNeutralityModal?: () => void;
}

// Haversine Distance Formula in Meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// RT 04 Sukamaju Community Center Default Benchmark
const RT04_BASE_COORDS = { lat: -7.7956, lng: 110.3695 };

export const AreaQuView: React.FC<AreaQuViewProps> = ({
  currentUser,
  areaPoints: initialAreaPoints,
  couriers: initialCouriers,
  onOpenUsaha,
  onOpenChat,
  showNotification,
  selectedRadiusMeters: propRadiusMeters,
  onSelectRadius,
  selectedCategory: propCategory,
  onSelectCategory,
  isRentalModalOpen: propRentalModalOpen,
  onCloseRentalModal,
  isNeutralityModalOpen: propNeutralityModalOpen,
  onCloseNeutralityModal,
}) => {
  // Radius & Category state (use prop if provided, else fallback to local)
  const [localRadiusMeters, setLocalRadiusMeters] = useState<number>(3000);
  const [localCategory, setLocalCategory] = useState<string>('all');
  const [localRentalModalOpen, setLocalRentalModalOpen] = useState(false);
  const [localNeutralityModalOpen, setLocalNeutralityModalOpen] = useState(false);

  const selectedRadiusMeters = propRadiusMeters ?? localRadiusMeters;
  const selectedCategory = propCategory ?? localCategory;
  const isRentalModalOpen = propRentalModalOpen ?? localRentalModalOpen;
  const isNeutralityModalOpen = propNeutralityModalOpen ?? localNeutralityModalOpen;

  const handleCloseRental = () => {
    if (onCloseRentalModal) onCloseRentalModal();
    setLocalRentalModalOpen(false);
  };

  const handleCloseNeutrality = () => {
    if (onCloseNeutralityModal) onCloseNeutralityModal();
    setLocalNeutralityModalOpen(false);
  };

  // View Mode: Interactive Map vs Card List
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // ====================================================
  // REAL GPS ENGINE & USER GEOLOCATION
  // ====================================================
  const [userGps, setUserGps] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    heading?: number | null;
  } | null>(null);

  const [gpsStatus, setGpsStatus] = useState<
    'detecting' | 'locked' | 'denied' | 'unavailable' | 'idle'
  >('detecting');

  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Active Map Center: 'gps' (focused on real user GPS) or 'rt04' (focused on RT 04 community center)
  const [activeAreaCenter, setActiveAreaCenter] = useState<'gps' | 'rt04'>('rt04');

  // Request / Trigger Live GPS
  const requestGpsLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unavailable');
      setGpsErrorMsg('GPS tidak didukung oleh browser/perangkat ini.');
      return;
    }

    setIsLocating(true);
    setGpsStatus('detecting');
    setGpsErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy, heading } = pos.coords;
        const newCoords = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 10),
          heading,
        };
        setUserGps(newCoords);
        setGpsStatus('locked');
        setIsLocating(false);
        setActiveAreaCenter('gps');
        showNotification(
          `🛰️ GPS Terdeteksi: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation initial error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setGpsErrorMsg('Izin akses lokasi ditolak oleh pengguna/perangkat.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsStatus('unavailable');
          setGpsErrorMsg('Sinyal GPS belum ditemukan. Pastikan GPS HP aktif.');
        } else if (err.code === err.TIMEOUT) {
          setGpsStatus('unavailable');
          setGpsErrorMsg('Pencarian GPS timeout. Menggunakan mode komunitas.');
        } else {
          setGpsStatus('unavailable');
          setGpsErrorMsg('Gagal mendapatkan titik GPS.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [showNotification]);

  // Run GPS auto-detection immediately on mount + background watchPosition
  useEffect(() => {
    requestGpsLocation();

    let watchId: number | null = null;
    if (typeof window !== 'undefined' && navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, accuracy, heading } = pos.coords;
            setUserGps({
              lat: latitude,
              lng: longitude,
              accuracy: Math.round(accuracy || 10),
              heading,
            });
            setGpsStatus('locked');
            setGpsErrorMsg(null);
          },
          (err) => {
            console.warn('Geolocation watch background warning:', err);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          }
        );
      } catch (e) {
        console.warn('watchPosition failed:', e);
      }
    }

    return () => {
      if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [requestGpsLocation]);

  // Points & Couriers State
  const [points, setPoints] = useState<AreaPoint[]>(() =>
    initialAreaPoints && initialAreaPoints.length > 0
      ? initialAreaPoints
      : AppQuStorageService.getAreaPoints()
  );

  const [couriers, setCouriers] = useState<TransportasiCourier[]>(() =>
    initialCouriers && initialCouriers.length > 0
      ? initialCouriers
      : AppQuStorageService.getCouriers()
  );

  // Selected Point for Silent Navigation
  const [selectedPoint, setSelectedPoint] = useState<AreaPoint | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<TransportasiCourier | null>(null);

  // HTML5 2D Canvas State for Ultra Lightweight Map (< 3MB RAM)
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [heartbeatCounter, setHeartbeatCounter] = useState(5);

  // Resize observer to ensure Canvas always fits container with 0 distortion
  useEffect(() => {
    const handleResize = () => {
      if (mapContainerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = mapContainerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          canvasRef.current.width = clientWidth;
          canvasRef.current.height = clientHeight;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(handleResize);
    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  // Simulate Lightweight Courier Heartbeat (Lat/Lng text packet every 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatCounter((prev) => {
        if (prev <= 1) {
          // Heartbeat tick: slightly move active couriers
          setCouriers((currentCouriers) =>
            currentCouriers.map((c) => {
              if (c.status === 'mengantar') {
                const deltaLat = (Math.random() - 0.45) * 0.0003;
                const deltaLng = (Math.random() - 0.45) * 0.0003;
                return {
                  ...c,
                  lat: c.lat + deltaLat,
                  lng: c.lng + deltaLng,
                  lastHeartbeatSeconds: 1,
                  batteryPercent: Math.max(10, c.batteryPercent - 0.1),
                };
              }
              return { ...c, lastHeartbeatSeconds: 1 };
            })
          );
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Reference Benchmark Coordinates for Map & Distance
  const activeBaseCoords = useMemo(() => {
    if (activeAreaCenter === 'gps' && userGps) {
      return { lat: userGps.lat, lng: userGps.lng };
    }
    return RT04_BASE_COORDS;
  }, [activeAreaCenter, userGps]);

  // Points adapted to current activeBaseCoords with dynamic real distance calculation
  const computedPoints = useMemo(() => {
    // If user is far from RT 04 (> 15km) and activeAreaCenter === 'gps', anchor points around user's GPS
    const isFarFromRT =
      userGps &&
      calculateDistanceMeters(
        userGps.lat,
        userGps.lng,
        RT04_BASE_COORDS.lat,
        RT04_BASE_COORDS.lng
      ) > 15000;

    return points.map((p, idx) => {
      let targetLat = p.lat;
      let targetLng = p.lng;

      if (activeAreaCenter === 'gps' && userGps && isFarFromRT) {
        // Deterministic offset around user's GPS so points are in user's real neighborhood
        const angle = (idx * (2 * Math.PI)) / points.length;
        const radiusDeg = 0.002 + (idx % 3) * 0.0015; // ~200m - 500m
        targetLat = userGps.lat + Math.sin(angle) * radiusDeg;
        targetLng = userGps.lng + Math.cos(angle) * radiusDeg;
      }

      const calculatedDistance = userGps
        ? calculateDistanceMeters(userGps.lat, userGps.lng, targetLat, targetLng)
        : p.distanceMeters;

      return {
        ...p,
        lat: targetLat,
        lng: targetLng,
        distanceMeters: calculatedDistance,
      };
    });
  }, [points, userGps, activeAreaCenter]);

  // Filter Points according to radius and category
  const filteredPoints = useMemo(() => {
    return computedPoints
      .filter((p) => {
        const matchesRadius = p.distanceMeters <= selectedRadiusMeters;
        if (!matchesRadius) return false;
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'lapak')
          return (
            p.category === 'kuliner' ||
            p.category === 'sembako' ||
            p.category === 'jasa' ||
            p.category === 'bengkel' ||
            p.category === 'klinik'
          );
        if (selectedCategory === 'transportasi') return p.category === 'transportasi';
        if (selectedCategory === 'fasum') return p.category === 'fasum';
        if (selectedCategory === 'titik_netral') return p.category === 'titik_netral';
        return p.category === selectedCategory;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [computedPoints, selectedRadiusMeters, selectedCategory]);

  // ----------------------------------------------------
  // CANVAS RENDERING (Lightweight 2D Vector Style)
  // ----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const centerX = width / 2 + mapPan.x;
    const centerY = height / 2 + mapPan.y;

    // Background Canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f5f5f4'; // Stone-100 base
    ctx.fillRect(0, 0, width, height);

    const baseLat = activeBaseCoords.lat;
    const baseLng = activeBaseCoords.lng;
    const scale = 24000 * mapZoom * (1500 / Math.max(500, selectedRadiusMeters * 0.7));

    const toScreen = (lat: number, lng: number) => {
      const x = centerX + (lng - baseLng) * scale;
      const y = centerY - (lat - baseLat) * scale;
      return { x, y };
    };

    // Draw Minimalist Vector Grid Roads
    ctx.strokeStyle = '#e7e5e4'; // stone-200
    ctx.lineWidth = 1;
    const gridSize = 32 * mapZoom;
    for (let x = centerX % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = centerY % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Main Vector Streets
    ctx.lineWidth = 6 * mapZoom;
    ctx.strokeStyle = '#d6d3d1'; // stone-300
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main Street East-West
    ctx.beginPath();
    ctx.moveTo(centerX - 350 * mapZoom, centerY + 30 * mapZoom);
    ctx.lineTo(centerX + 350 * mapZoom, centerY + 30 * mapZoom);
    ctx.stroke();

    // Secondary Street North-South
    ctx.beginPath();
    ctx.moveTo(centerX - 20 * mapZoom, centerY - 280 * mapZoom);
    ctx.lineTo(centerX - 20 * mapZoom, centerY + 280 * mapZoom);
    ctx.stroke();

    // Alleyway Gang RT (Gang Mawar, Gang Melati)
    ctx.lineWidth = 3.5 * mapZoom;
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(centerX - 140 * mapZoom, centerY - 140 * mapZoom);
    ctx.lineTo(centerX + 180 * mapZoom, centerY - 140 * mapZoom);
    ctx.lineTo(centerX + 180 * mapZoom, centerY + 160 * mapZoom);
    ctx.stroke();

    // Draw Geofencing Boundary
    ctx.strokeStyle = '#059669'; // emerald-600
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
    ctx.beginPath();
    const rtPolygon = [
      { lat: baseLat + 0.002, lng: baseLng - 0.0025 },
      { lat: baseLat + 0.002, lng: baseLng + 0.0025 },
      { lat: baseLat - 0.002, lng: baseLng + 0.0025 },
      { lat: baseLat - 0.002, lng: baseLng - 0.0025 },
    ];
    rtPolygon.forEach((pt, idx) => {
      const scr = toScreen(pt.lat, pt.lng);
      if (idx === 0) ctx.moveTo(scr.x, scr.y);
      else ctx.lineTo(scr.x, scr.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Label Geofence Area
    const rtLabelPos = toScreen(baseLat + 0.002, baseLng);
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.textAlign = 'center';
    ctx.fillText(
      activeAreaCenter === 'gps'
        ? 'Area Radius GPS Pengguna (Zona Terdeteksi)'
        : 'Geofence RT 04 Sukamaju (Pusat Komunitas)',
      rtLabelPos.x,
      rtLabelPos.y - 8
    );

    // Draw Selected Radius Circle Ring (e.g., 500m, 1km, 3km)
    const radiusPixels = (selectedRadiusMeters / 1000) * (scale / 111);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusPixels, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(5, 150, 105, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Radius Label Ring
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText(
      `Radius Filter: ${selectedRadiusMeters >= 1000 ? `${selectedRadiusMeters / 1000} km` : `${selectedRadiusMeters} m`}`,
      centerX,
      centerY - radiusPixels + 12
    );

    // ----------------------------------------------------
    // USER GPS / BENCHMARK BEACON (BLUE PULSE RADAR)
    // ----------------------------------------------------
    const userScr = userGps ? toScreen(userGps.lat, userGps.lng) : { x: centerX, y: centerY };

    // Accuracy Circle Ring if user GPS is available
    if (userGps && userGps.accuracy) {
      const accRadiusPixels = Math.max(16, (userGps.accuracy / 1000) * (scale / 111));
      ctx.beginPath();
      ctx.arc(userScr.x, userScr.y, accRadiusPixels, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Outer Animated Radar Pulse
    ctx.beginPath();
    ctx.arc(userScr.x, userScr.y, 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center Core Dot
    ctx.beginPath();
    ctx.arc(userScr.x, userScr.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = userGps ? '#0284c7' : '#059669'; // Sky-600 for live GPS, Emerald for community RT
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Beacon Text
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = '#0369a1';
    ctx.textAlign = 'center';
    ctx.fillText(userGps ? '📍 Posisi GPS Saya' : '📍 Pusat RT 04', userScr.x, userScr.y - 12);

    // ----------------------------------------------------
    // DRAW AREA POINTS (MARKERS)
    // ----------------------------------------------------
    filteredPoints.forEach((pt) => {
      const scr = toScreen(pt.lat, pt.lng);
      const isSelected = selectedPoint?.id === pt.id;

      // Draw direct line if selected (Silent Navigation Distance Line)
      if (isSelected) {
        ctx.beginPath();
        ctx.moveTo(userScr.x, userScr.y);
        ctx.lineTo(scr.x, scr.y);
        ctx.strokeStyle = '#0284c7'; // Sky-600
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Direct Distance Label along line
        const midX = (userScr.x + scr.x) / 2;
        const midY = (userScr.y + scr.y) / 2;
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 11px system-ui, sans-serif';
        const distStr =
          pt.distanceMeters >= 1000
            ? `${(pt.distanceMeters / 1000).toFixed(1)} km`
            : `${pt.distanceMeters} m`;
        ctx.fillText(`Jarak: ${distStr}`, midX, midY - 6);
      }

      // Priority Digital Stall Glow Aura (Rp 30.000/bln trial)
      if (pt.isDigitalStallRented) {
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.28)'; // Amber glow
        ctx.fill();
      }

      // Marker Circle
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, isSelected ? 12 : 9, 0, Math.PI * 2);

      if (pt.isPoliticalOrNeutralOnly) {
        ctx.fillStyle = '#64748b'; // Slate gray for Neutral Static Points
      } else if (pt.category === 'fasum') {
        ctx.fillStyle = '#0284c7'; // Sky blue for Fasum
      } else if (pt.isDigitalStallRented) {
        ctx.fillStyle = '#d97706'; // Golden amber for Priority Stall
      } else if (pt.businessMode === 'mode_a_pos') {
        ctx.fillStyle = '#059669'; // Emerald for Mode A POS Warung
      } else {
        ctx.fillStyle = '#7c3aed'; // Violet for Mode B Catalog
      }
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Marker Icon / Text
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillStyle = '#1c1917';
      ctx.textAlign = 'center';
      const label = pt.name.length > 14 ? `${pt.name.slice(0, 12)}...` : pt.name;
      ctx.fillText(label, scr.x, scr.y + 18);
    });

    // Render TransportasiQu Couriers Layer (🛵 moving on canvas)
    couriers.forEach((courier) => {
      // Offset courier around active center if in GPS mode
      const courierLat =
        activeAreaCenter === 'gps' && userGps
          ? userGps.lat + (courier.lat - RT04_BASE_COORDS.lat)
          : courier.lat;
      const courierLng =
        activeAreaCenter === 'gps' && userGps
          ? userGps.lng + (courier.lng - RT04_BASE_COORDS.lng)
          : courier.lng;

      const scr = toScreen(courierLat, courierLng);
      const isSelected = selectedCourier?.id === courier.id;

      // Pulse circle for courier heartbeat
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
      ctx.fill();

      // Courier Pin (Scooter representation)
      ctx.beginPath();
      ctx.arc(scr.x, scr.y, isSelected ? 11 : 8.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7'; // Sky-600
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Scooter Emoji
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛵', scr.x, scr.y - 10);

      // Courier Name & Plate
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillStyle = '#0369a1';
      ctx.fillText(courier.driverName, scr.x, scr.y + 17);
    });
  }, [
    filteredPoints,
    couriers,
    mapZoom,
    mapPan,
    selectedRadiusMeters,
    selectedPoint,
    selectedCourier,
    activeBaseCoords,
    userGps,
    activeAreaCenter,
  ]);

  // Canvas Mouse / Touch Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setMapPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Canvas Click to select marker
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + mapPan.x;
    const centerY = height / 2 + mapPan.y;
    const baseLat = activeBaseCoords.lat;
    const baseLng = activeBaseCoords.lng;
    const scale = 24000 * mapZoom * (1500 / Math.max(500, selectedRadiusMeters * 0.7));

    // Check click on couriers first
    for (const courier of couriers) {
      const courierLat =
        activeAreaCenter === 'gps' && userGps
          ? userGps.lat + (courier.lat - RT04_BASE_COORDS.lat)
          : courier.lat;
      const courierLng =
        activeAreaCenter === 'gps' && userGps
          ? userGps.lng + (courier.lng - RT04_BASE_COORDS.lng)
          : courier.lng;
      const scrX = centerX + (courierLng - baseLng) * scale;
      const scrY = centerY - (courierLat - baseLat) * scale;
      const dist = Math.hypot(clickX - scrX, clickY - scrY);
      if (dist < 22) {
        setSelectedCourier(courier);
        setSelectedPoint(null);
        return;
      }
    }

    // Check click on points
    for (const pt of filteredPoints) {
      const scrX = centerX + (pt.lng - baseLng) * scale;
      const scrY = centerY - (pt.lat - baseLat) * scale;
      const dist = Math.hypot(clickX - scrX, clickY - scrY);
      if (dist < 22) {
        setSelectedPoint(pt);
        setSelectedCourier(null);
        return;
      }
    }

    // Click on empty space
    setSelectedPoint(null);
    setSelectedCourier(null);
  };

  // Touch Support for Mobile Dragging
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - mapPan.x, y: touch.clientY - mapPan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setMapPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Launch Silent Navigation to external Google Maps / Waze
  const handleLaunchGoogleMaps = (lat: number, lng: number, name: string) => {
    const originParam = userGps ? `&origin=${userGps.lat},${userGps.lng}` : '';
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${originParam}&destination_place_id=${encodeURIComponent(
      name
    )}`;
    window.open(url, '_blank');
    showNotification(`Membuka rute ke ${name} di Google Maps (Navigasi Hening)`);
  };

  const handleLaunchWaze = (lat: number, lng: number, name: string) => {
    const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(url, '_blank');
    showNotification(`Membuka rute ke ${name} di Waze`);
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-100 overflow-hidden relative h-full">
      {/* ========================================================= */}
      {/* TOP GPS LIVE STATUS & QUICK CONTROLS BAR                  */}
      {/* ========================================================= */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-100 px-3 py-2 flex items-center justify-between text-xs shrink-0 select-none shadow-xs z-20">
        {/* Left: GPS Indicator Pill */}
        <div className="flex items-center gap-2 min-w-0">
          {gpsStatus === 'detecting' && (
            <div className="flex items-center gap-1.5 text-amber-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span className="font-semibold text-[11px] truncate">Mencari Sinyal GPS...</span>
            </div>
          )}

          {gpsStatus === 'locked' && userGps && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-2 ring-emerald-500/30"></span>
              <div className="truncate">
                <p className="font-bold text-[11px] text-white flex items-center gap-1 leading-none">
                  <span className="text-emerald-400">GPS Terdeteksi</span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    (±{userGps.accuracy}m)
                  </span>
                </p>
                <p className="text-[10px] font-mono text-emerald-200/80 truncate mt-0.5">
                  {userGps.lat.toFixed(4)}, {userGps.lng.toFixed(4)}
                </p>
              </div>
            </div>
          )}

          {(gpsStatus === 'denied' || gpsStatus === 'unavailable') && (
            <div className="flex items-center gap-1.5 text-amber-300 min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-[11px] block truncate">
                  {gpsStatus === 'denied' ? 'Izin GPS Ditolak' : 'GPS Belum Aktif'}
                </span>
                <span className="text-[9px] text-stone-400 block truncate">
                  Peta beralih ke Mode Komunitas
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Refresh / Re-detect GPS button */}
          <button
            type="button"
            onClick={requestGpsLocation}
            disabled={isLocating}
            className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
            title="Deteksi Ulang GPS HP"
          >
            <Locate className={`w-3 h-3 text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Cari...' : 'Cek GPS'}</span>
          </button>

          {/* Toggle View Mode: Peta vs Daftar */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95 ${
              viewMode === 'list'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {viewMode === 'map' ? (
              <>
                <List className="w-3 h-3" />
                <span>Daftar</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3 h-3" />
                <span>Peta</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW MODE 1: INTERACTIVE MAP CANVAS                       */}
      {/* ========================================================= */}
      {viewMode === 'map' && (
        <div ref={mapContainerRef} className="flex-1 relative overflow-hidden bg-stone-200 w-full">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
          />

          {/* Top-Right Map Controls (+, -, Center GPS, Center RT04) */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.min(2.5, z + 0.25))}
              className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-stone-800 shadow-md flex items-center justify-center border border-stone-200 font-bold cursor-pointer transition-all active:scale-95"
              title="Perbesar Peta"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.max(0.6, z - 0.25))}
              className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-stone-800 shadow-md flex items-center justify-center border border-stone-200 font-bold cursor-pointer transition-all active:scale-95"
              title="Perkecil Peta"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Target ke GPS Saya */}
            <button
              type="button"
              onClick={() => {
                if (userGps) {
                  setActiveAreaCenter('gps');
                  setMapPan({ x: 0, y: 0 });
                  setMapZoom(1.2);
                  showNotification('Peta dipusatkan ke koordinat GPS Anda.');
                } else {
                  requestGpsLocation();
                }
              }}
              className={`w-9 h-9 rounded-xl shadow-md flex items-center justify-center font-bold cursor-pointer transition-all active:scale-95 ${
                activeAreaCenter === 'gps' && userGps
                  ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                  : 'bg-white/95 text-sky-700 hover:bg-white border border-stone-200'
              }`}
              title="Pusatkan ke Posisi GPS Saya"
            >
              <LocateFixed className="w-4 h-4" />
            </button>

            {/* Target ke Pusat RT 04 */}
            <button
              type="button"
              onClick={() => {
                setActiveAreaCenter('rt04');
                setMapPan({ x: 0, y: 0 });
                setMapZoom(1);
                showNotification('Peta dipusatkan ke Pos Komunitas RT 04 Sukamaju.');
              }}
              className={`w-9 h-9 rounded-xl shadow-md flex items-center justify-center font-bold cursor-pointer transition-all active:scale-95 ${
                activeAreaCenter === 'rt04'
                  ? 'bg-emerald-800 text-white ring-2 ring-emerald-300'
                  : 'bg-white/95 text-emerald-800 hover:bg-white border border-stone-200'
              }`}
              title="Pusatkan ke Pos Komunitas RT 04"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* Top-Left Courier Heartbeat Live Bar */}
          <div className="absolute top-3 left-3 bg-stone-900/90 text-stone-100 backdrop-blur-xs px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-stone-700 shadow-md z-10">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>TransportasiQu ({heartbeatCounter}s)</span>
            <span className="text-sky-300 font-mono font-normal">
              {couriers.length} Kurir Aktif
            </span>
          </div>

          {/* Bottom-Left Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-stone-200/80 shadow-md text-[10px] space-y-1 z-10">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
              <span>Lapak Sewa Prioritas (Trial)</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Mode A POS Warung</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>Mode B Katalog</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              <span>🛵 Kurir Bergerak</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 2: CARD LIST OF NEARBY PLACES BY REAL DISTANCE  */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-stone-100">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-800">
              {filteredPoints.length} Titik UMKM & Fasilitas (Urut Terdekat)
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Filter Radius: {selectedRadiusMeters >= 1000 ? `${selectedRadiusMeters / 1000} km` : `${selectedRadiusMeters} m`}
            </span>
          </div>

          {filteredPoints.map((pt) => {
            const isSelected = selectedPoint?.id === pt.id;
            return (
              <div
                key={pt.id}
                onClick={() => {
                  setSelectedPoint(pt);
                  setViewMode('map');
                }}
                className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-stone-200/90 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base text-white shrink-0 ${
                        pt.isDigitalStallRented
                          ? 'bg-amber-500'
                          : pt.category === 'fasum'
                          ? 'bg-blue-600'
                          : pt.category === 'bengkel'
                          ? 'bg-indigo-600'
                          : pt.category === 'klinik'
                          ? 'bg-rose-600'
                          : 'bg-emerald-700'
                      }`}
                    >
                      {pt.category === 'kuliner'
                        ? '🍲'
                        : pt.category === 'sembako'
                        ? '🛒'
                        : pt.category === 'bengkel'
                        ? '🔧'
                        : pt.category === 'klinik'
                        ? '💊'
                        : pt.category === 'fasum'
                        ? '🏛️'
                        : '📍'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-xs text-stone-900 truncate">
                          {pt.name}
                        </h4>
                        {pt.isDigitalStallRented && (
                          <span className="text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-full">
                            Prioritas Emas
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {pt.blockNumber} • {pt.ownerName || 'RT 04'}
                      </p>
                    </div>
                  </div>

                  {/* Real Distance Badge */}
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold text-xs border border-emerald-300">
                      {formatDistance(pt.distanceMeters)}
                    </span>
                    <span className="block text-[10px] text-stone-400 mt-0.5">dari GPS</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                  {pt.description}
                </p>

                {/* Quick Action Navigation Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchGoogleMaps(pt.lat, pt.lng, pt.name);
                    }}
                    className="flex-1 py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Google Maps</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchWaze(pt.lat, pt.lng, pt.name);
                    }}
                    className="flex-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Waze</span>
                  </button>
                  {pt.phone && (
                    <a
                      href={`https://wa.me/${pt.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center cursor-pointer transition-all"
                      title="Hubungi WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SILENT NAVIGATION DRAWER (POP-UP JIKA TITIK DIPILIH)   */}
      {/* ========================================================= */}
      {selectedPoint && (
        <div className="bg-white border-t border-stone-200 p-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200 shrink-0 z-20 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-2xs ${
                  selectedPoint.isDigitalStallRented
                    ? 'bg-amber-500'
                    : selectedPoint.category === 'fasum'
                    ? 'bg-blue-600'
                    : selectedPoint.isPoliticalOrNeutralOnly
                    ? 'bg-stone-500'
                    : 'bg-emerald-700'
                }`}
              >
                {selectedPoint.category === 'kuliner'
                  ? '🍲'
                  : selectedPoint.category === 'sembako'
                  ? '🛒'
                  : selectedPoint.category === 'bengkel'
                  ? '🔧'
                  : selectedPoint.category === 'klinik'
                  ? '💊'
                  : selectedPoint.category === 'fasum'
                  ? '🏛️'
                  : '📍'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {selectedPoint.name}
                  </h3>
                  {selectedPoint.isDigitalStallRented && (
                    <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                      Prioritas Sewa (Trial)
                    </span>
                  )}
                  {selectedPoint.businessMode && (
                    <span className="text-[10px] bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded">
                      {selectedPoint.businessMode === 'mode_a_pos' ? 'Mode A: POS' : 'Mode B: Katalog'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  {selectedPoint.blockNumber} • Owner: {selectedPoint.ownerName || 'RT 04'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPoint(null)}
              className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {selectedPoint.description}
          </p>

          {/* Distance & Coordinate Stats */}
          <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1 font-bold text-stone-800">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Jarak Terhitung: {formatDistance(selectedPoint.distanceMeters)}</span>
            </div>
            <div className="text-[11px] font-mono text-stone-500">
              {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                handleLaunchGoogleMaps(selectedPoint.lat, selectedPoint.lng, selectedPoint.name)
              }
              className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Navigation2 className="w-4 h-4 text-emerald-400" />
              <span>Google Maps</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleLaunchWaze(selectedPoint.lat, selectedPoint.lng, selectedPoint.name)
              }
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Waze</span>
            </button>

            {onOpenUsaha && !selectedPoint.isPoliticalOrNeutralOnly && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPoint(null);
                  onOpenUsaha();
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Store className="w-4 h-4" />
                <span>Buka Lapak</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. COURIER DETAIL DRAWER (🛵 SELEKSI KURIR)               */}
      {/* ========================================================= */}
      {selectedCourier && (
        <div className="bg-white border-t border-stone-200 p-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200 shrink-0 z-20 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center font-black text-xl text-white shadow-2xs">
                🛵
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {selectedCourier.driverName}
                  </h3>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-300">
                    {selectedCourier.vehiclePlate}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedCourier.vehicleType} • Baterai HP: {Math.round(selectedCourier.batteryPercent)}%
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCourier(null)}
              className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs bg-sky-50 p-2.5 rounded-xl border border-sky-100 text-sky-950 font-medium">
            <span>Status: {selectedCourier.status.toUpperCase()}</span>
            <span className="font-mono text-sky-700">
              Heartbeat: {selectedCourier.lastHeartbeatSeconds}s lalu
            </span>
          </div>

          {/* 1-Click AppQu Local Chat & WhatsApp Chat/Call to Driver */}
          <div className="flex items-center gap-2 pt-1">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCourier(null);
                  onOpenChat('thread_transport_slamet');
                }}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-emerald-600/40 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat Driver (AppQu Local)</span>
              </button>
            )}
            <a
              href={`https://wa.me/${selectedCourier.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: SEWA LAPAK DIGITAL (RP 30.000 / TRIAL 10 HARI)  */}
      {/* ========================================================= */}
      {isRentalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-stone-900 leading-tight">
                    Sewa Lapak Digital AreaQu
                  </h3>
                  <p className="text-xs text-stone-500">Monetisasi Mandiri & Prioritas Peta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseRental}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center cursor-pointer hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Paket Langganan Warga
                </span>
                <span className="text-xs bg-amber-600 text-white font-black px-2 py-0.5 rounded-full">
                  Trial 10 Hari Gratis
                </span>
              </div>
              <div className="text-2xl font-black text-amber-950">
                Rp 30.000 <span className="text-xs font-normal text-amber-800">/ bulan</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Tampilkan usaha Anda dengan pin prioritas bercahaya (glowing pin) di peta radius
                AreaQu, serta etalase katalog paling atas untuk seluruh warga lingkungan.
              </p>
            </div>

            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pin Peta Emas Berkedip dengan Radius Filter hingga 100km</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Navigasi Langsung (Silent Navigation) ke WhatsApp & Google Maps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Dukungan Offline-First & Gratis Biaya Server</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  showNotification('Trial 10 Hari Sewa Lapak Digital berhasil diaktifkan!');
                  handleCloseRental();
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Aktifkan Trial 10 Hari Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: KEBIJAKAN NETRALITAS (ORMAS & PARTAI POLITIK)   */}
      {/* ========================================================= */}
      {isNeutralityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-stone-900 leading-tight">
                    Kebijakan Netralitas AppQu
                  </h3>
                  <p className="text-xs text-stone-500">Bebas Politik Praktis & Propaganda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseNeutrality}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center cursor-pointer hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-black">1. Netralitas Peta AreaQu:</strong>
                <span>
                  Markas ormas / partai politik dari OpenStreetMap (OSM) hanya menjadi{' '}
                  <strong>titik statis biasa</strong>. DILARANG membeli fitur Sewa Lapak Digital atau
                  iklan prioritas komersial.
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-black">2. Komando Panic Button RT:</strong>
                <span>
                  Ormas dan Partai Politik <strong>TIDAK MEMILIKI akses khusus</strong> atau wewenang
                  komando atas tombol darurat Panic Button RT. Jalur keamanan murni di bawah koordinasi
                  RT, Hansip, Babinsa, dan Bhabinkamtibmas.
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-black">3. Moderasi Otomatis (≥ 3 Laporan):</strong>
                <span>
                  Postingan provokatif, kampanye pemilu, atau ajakan ormas di WargaQu yang dilaporkan
                  oleh minimal 3 warga akan otomatis disembunyikan (Auto-Hide).
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseNeutrality}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Saya Mengerti & Setuju
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
