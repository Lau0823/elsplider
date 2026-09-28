'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// 1. CONFIGURACIÓN DE IMÁGENES EXACTAS
// ==========================================
const SPLASH_BG_IMAGE = 'https://i.pinimg.com/736x/f9/19/8d/f9198d0f8ff5d994c840f9f1167ddaca.jpg';
const JESUS_IMAGE_URL = 'https://i.pinimg.com/1200x/d2/b3/f0/d2b3f032df40e23e4083ada49899f7c4.jpg';
const HOME_BG_IMAGE = 'https://i.pinimg.com/736x/49/9f/9c/499f9c29aaa32d7dc3ef14be1eb1de26.jpg';

// Fotos del carrusel automático a 3/4 de pantalla
const BANNER_IMAGES = [
  'https://i.pinimg.com/736x/49/9f/9c/499f9c29aaa32d7dc3ef14be1eb1de26.jpg',
  'https://i.pinimg.com/1200x/13/6d/09/136d09c272260d30cffa1e97027a241e.jpg',
  'https://i.pinimg.com/736x/e6/9b/d2/e69bd2cb1009df8647ceb1c7267839a2.jpg',
];

// ==========================================
// 2. NÚMERO WHATSAPP DE LOS LÍDERES
// ==========================================
const LEADERS_GLOBAL_WHATSAPP = '573102345742';

// ==========================================
// 3. LÍDERES
// ==========================================
interface Leader {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
}

const LEADERS: Leader[] = [
  {
    id: 'male',
    name: 'Líder Male',
    role: 'Acompañamiento & Mujeres',
    photoUrl: '/WhatsApp Image 2026-09-27 at 18.56.25 (2).jpeg',
  },
  {
    id: 'sebas',
    name: 'Líder Sebas',
    role: 'Jóvenes & Liderazgo',
    photoUrl: '/WhatsApp Image 2026-09-27 at 18.59.15.jpeg',
  },
  {
    id: 'marce',
    name: 'Líder Marce',
    role: 'Familia & Consejería',
    photoUrl: '/WhatsApp Image 2026-09-27 at 18.56.08 (2).jpeg',
  },
];

const MONTHS_2026 = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEK_DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

interface TimeSlot {
  id: string;
  time: string;
  modality: 'church' | 'cafe' | 'virtual';
  bookedBy?: string;
  phone?: string;
}

interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];
}

export default function ChurchInteractiveBooking() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFade, setSplashFade] = useState(false);

  // Estado del carrusel automático
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Modo de vista: usuario vs líder
  const [viewMode, setViewMode] = useState<'user' | 'leader'>('user');

  // Líder y fecha seleccionada
  const [selectedLeader, setSelectedLeader] = useState<Leader>(LEADERS[0]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // Marzo 2026
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(10);

  // Formulario de reserva
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [selectedModality, setSelectedModality] = useState<'church' | 'cafe' | 'virtual'>('church');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Registro del último agendamiento
  const [lastBooking, setLastBooking] = useState<{
    leaderName: string;
    personName: string;
    personPhone: string;
    date: string;
    time: string;
    modalityText: string;
  } | null>(null);

  // Formulario del líder
  const [newTimeInput, setNewTimeInput] = useState('');

  // Base de datos reactiva local
  const [agendaDB, setAgendaDB] = useState<Record<string, DaySchedule>>({
    'male_2_10': {
      isOpen: true,
      slots: [
        { id: 's1', time: '09:00 AM', modality: 'church' },
        { id: 's2', time: '11:00 AM', modality: 'cafe', bookedBy: 'Camila R.', phone: '3123456789' },
        { id: 's3', time: '03:30 PM', modality: 'virtual' },
        { id: 's4', time: '05:00 PM', modality: 'church' },
      ],
    },
    'male_2_11': {
      isOpen: false,
      slots: [],
    },
    'male_2_12': {
      isOpen: true,
      slots: [
        { id: 's5', time: '10:00 AM', modality: 'church' },
        { id: 's6', time: '04:00 PM', modality: 'virtual' },
      ],
    },
  });

  // Temporizador para el Splash
  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFade(true), 1800);
    const removeTimer = setTimeout(() => setShowSplash(false), 2400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Intervalo del carrusel automático (3.5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const getDayKey = (day: number) => `${selectedLeader.id}_${currentMonthIndex}_${day}`;

  const getDayData = (day: number): DaySchedule => {
    const key = getDayKey(day);
    if (agendaDB[key]) {
      return agendaDB[key];
    }
    const defaultOpen = day % 2 === 0;
    return {
      isOpen: defaultOpen,
      slots: defaultOpen
        ? [
            { id: `auto-1-${day}`, time: '10:00 AM', modality: 'church' },
            { id: `auto-2-${day}`, time: '03:00 PM', modality: 'virtual' },
          ]
        : [],
    };
  };

  const generateCalendarData = (monthIndex: number) => {
    const year = 2026;
    const firstDayIndex = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const blanks = Array.from({ length: firstDayIndex });
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return { blanks, days };
  };

  const { blanks, days } = generateCalendarData(currentMonthIndex);
  const currentDayData = getDayData(selectedDayNumber);

  // Funciones de administración del líder
  const handleToggleDayOpen = () => {
    const key = getDayKey(selectedDayNumber);
    const existing = getDayData(selectedDayNumber);
    setAgendaDB((prev) => ({
      ...prev,
      [key]: {
        ...existing,
        isOpen: !existing.isOpen,
      },
    }));
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeInput.trim()) return;
    const key = getDayKey(selectedDayNumber);
    const existing = getDayData(selectedDayNumber);

    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time: newTimeInput.trim(),
      modality: 'church',
    };

    setAgendaDB((prev) => ({
      ...prev,
      [key]: {
        ...existing,
        isOpen: true,
        slots: [...existing.slots, newSlot],
      },
    }));
    setNewTimeInput('');
  };

  const handleDeleteSlot = (slotId: string) => {
    const key = getDayKey(selectedDayNumber);
    const existing = getDayData(selectedDayNumber);
    setAgendaDB((prev) => ({
      ...prev,
      [key]: {
        ...existing,
        slots: existing.slots.filter((s) => s.id !== slotId),
      },
    }));
  };

  const getModalityLabel = (m: 'church' | 'cafe' | 'virtual') => {
    switch (m) {
      case 'church':
        return 'Presencial en la Iglesia';
      case 'cafe':
        return 'Presencial en un Café cercano';
      case 'virtual':
        return 'Virtual por Google Meet / Videollamada';
    }
  };

  // Confirmar reserva y enviar a WhatsApp de los líderes
  const handleBookAppointment = () => {
    if (!userName.trim() || !userPhone.trim() || !selectedSlotId) return;
    const key = getDayKey(selectedDayNumber);
    const existing = getDayData(selectedDayNumber);
    const bookedSlot = existing.slots.find((s) => s.id === selectedSlotId);
    if (!bookedSlot) return;

    setAgendaDB((prev) => ({
      ...prev,
      [key]: {
        ...existing,
        slots: existing.slots.map((s) =>
          s.id === selectedSlotId
            ? { ...s, bookedBy: userName.trim(), phone: userPhone.trim(), modality: selectedModality }
            : s
        ),
      },
    }));

    const dateFormatted = `${selectedDayNumber} de ${MONTHS_2026[currentMonthIndex]} de 2026`;
    const modalityText = getModalityLabel(selectedModality);

    const bookingInfo = {
      leaderName: selectedLeader.name,
      personName: userName.trim(),
      personPhone: userPhone.trim().replace(/\D/g, ''),
      date: dateFormatted,
      time: bookedSlot.time,
      modalityText,
    };
    setLastBooking(bookingInfo);
    setBookingSuccess(true);

    const leaderMessage = encodeURIComponent(
      `¡Hola líderes! 👋\n\nSe ha reservado una nueva cita de ministración:\n\n` +
      `👤 *Persona:* ${bookingInfo.personName}\n` +
      `📱 *WhatsApp:* ${bookingInfo.personPhone}\n` +
      `✝️ *Líder asignado:* ${bookingInfo.leaderName}\n` +
      `🗓 *Fecha:* ${bookingInfo.date}\n` +
      `⏰ *Hora:* ${bookingInfo.time}\n` +
      `📍 *Modalidad:* ${bookingInfo.modalityText}\n\n` +
      `¡Bendiciones!`
    );

    window.open(`https://wa.me/${LEADERS_GLOBAL_WHATSAPP}?text=${leaderMessage}`, '_blank');
  };

  // Enviar mensaje al WhatsApp de quien saca la cita
  const handleSendToUserWhatsApp = () => {
    if (!lastBooking) return;
    const rawNumber = lastBooking.personPhone.startsWith('57')
      ? lastBooking.personPhone
      : `57${lastBooking.personPhone}`;

    const userMessage = encodeURIComponent(
      `¡Hola ${lastBooking.personName}! ✨\n\nTu cita de ministración ha sido reservada con éxito:\n\n` +
      `✝️ *Con:* ${lastBooking.leaderName}\n` +
      `🗓 *Fecha:* ${lastBooking.date}\n` +
      `⏰ *Hora:* ${lastBooking.time}\n` +
      `📍 *Modalidad:* ${lastBooking.modalityText}\n\n` +
      `Estamos orando por este tiempo y expectantes de lo que Dios hará. ¡Te esperamos!`
    );

    window.open(`https://wa.me/${rawNumber}?text=${userMessage}`, '_blank');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0b0d10] text-neutral-100 font-sans selection:bg-sky-500/30 overflow-x-hidden">
      
      {/* Importación de tipografías */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800;900&family=Playfair+Display:ital,wght@1,500;1,600&display=swap');
        
        .font-editorial-bold {
          font-family: 'Montserrat', sans-serif;
        }
        .font-editorial-script {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }
      `}</style>

      {/* ========================================================
          1. SPLASH SCREEN (JESÚS + CARGANDO) - SIN OVERLAY
         ======================================================== */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
            splashFade ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
          }`}
        >
          {/* Imagen de fondo limpia y nítida (100% visible, sin filtro ni overlay oscuro/blanco) */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: `url(${SPLASH_BG_IMAGE})` }}
          />

          {/* Contenido flotante directo */}
          <div className="flex flex-col items-center gap-5 text-center px-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-black/40 backdrop-blur-md border border-white/30 shadow-2xl animate-pulse">
              <img
                src={JESUS_IMAGE_URL}
                alt="Jesús"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 rounded-full border border-sky-400 animate-ping pointer-events-none" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-[0.35em] font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Cargando...
              </span>
              <div className="w-32 h-1 bg-black/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
                <div className="h-full bg-sky-400 rounded-full animate-pulse w-full shadow-[0_0_8px_#38bdf8]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HEADER DARK MODE */}
      <header className="w-full px-4 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3 border-b border-white/10 bg-[#0b0d10]/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-950/80 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/30">
            ✦
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white font-editorial-bold">
              AGENDA DE MINISTRACIONES
            </h1>
            <p className="text-[10px] text-neutral-400">Citas & Disponibilidad 2026</p>
          </div>
        </div>

        {/* Switch Usuario / Líder */}
        <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-full text-xs">
          <button
            onClick={() => setViewMode('user')}
            className={`px-3 py-1 rounded-full transition-all ${
              viewMode === 'user'
                ? 'bg-sky-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            👤 Modo Agendar Cita
          </button>
          <button
            onClick={() => setViewMode('leader')}
            className={`px-3 py-1 rounded-full transition-all ${
              viewMode === 'leader'
                ? 'bg-neutral-800 text-sky-300 font-bold shadow-sm border border-sky-400/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ⚙️ Modo Líder (Editar Horarios)
          </button>
        </div>
      </header>

      {/* 3. BANNER CARRUSEL AUTOMÁTICO A 3/4 DE LA PANTALLA (h-[75vh]) */}
      <section className="relative w-full h-[75vh] overflow-hidden border-b border-white/10 bg-neutral-950">
        {BANNER_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              currentBannerIndex === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        {/* Degradado inferior oscuro para fundir con la página */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d10] via-transparent to-[#0b0d10]/30 pointer-events-none" />

        {/* Indicadores en barra inferior */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {BANNER_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentBannerIndex === idx ? 'w-10 bg-sky-400 shadow-[0_0_8px_#38bdf8]' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`Foto ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 4. TÍTULO EDITORIAL CON LAS FUENTES SOLICITADAS (DARK MODE) */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-12 sm:pt-16 pb-4 text-center">
        <span className="text-[11px] uppercase tracking-[0.25em] text-sky-400 font-bold block mb-2 font-editorial-bold">
          
        </span>
        
        {/* Letras con estilo de la imagen: Sans-serif Bold + Cursiva elegante */}
        <div className="inline-block">
          <span className="text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white block font-editorial-bold">
            AGENDA LA CITA
          </span>
          <span className="text-4xl sm:text-6xl md:text-7xl font-editorial-script text-sky-300 block -mt-1 sm:-mt-3 tracking-normal drop-shadow-[0_0_12px_rgba(56,189,248,0.25)]">
            con tu líder
          </span>
        </div>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-4 mb-10 leading-relaxed font-light">
          Selecciona a uno de nuestros líderes para abrir su calendario y consultar las horas disponibles.
        </p>

        {/* 3 Círculos centrados */}
        <div className="flex justify-center items-center gap-6 sm:gap-14">
          {LEADERS.map((leader) => {
            const isSelected = selectedLeader.id === leader.id;
            return (
              <button
                key={leader.id}
                onClick={() => {
                  setSelectedLeader(leader);
                  setSelectedSlotId(null);
                }}
                className={`flex flex-col items-center transition-all duration-300 group outline-none ${
                  isSelected ? 'scale-105' : 'opacity-65 hover:opacity-100'
                }`}
              >
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 transition-all shadow-lg ${
                    isSelected
                      ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-[#0b0d10] shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                      : 'border-2 border-white/20 group-hover:border-white/40'
                  }`}
                >
                  <img
                    src={leader.photoUrl}
                    alt={leader.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                  {isSelected && (
                    <span className="absolute bottom-0 right-0 w-6 h-6 bg-sky-400 text-neutral-950 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-bold mt-2 text-white font-editorial-bold">
                  {leader.name}
                </span>
                <span className="text-[10px] text-neutral-400">{leader.role}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. DASHBOARD CALENDARIO DARK + AZULITO BABY */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* PANEL IZQUIERDO: CALENDARIO */}
        <div className="lg:col-span-8 bg-[#14171d]/90 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-editorial-bold">
                  {MONTHS_2026[currentMonthIndex]} <span className="font-light text-neutral-500">2026</span>
                </h3>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Verde: Disponible
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    Rojo: No disponible
                  </span>
                </div>
              </div>

              {/* Selector de Mes */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-full self-start sm:self-auto">
                <button
                  disabled={currentMonthIndex === 0}
                  onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition text-white font-bold"
                >
                  ‹
                </button>
                <span className="text-xs font-semibold px-2 min-w-[70px] text-center text-white">
                  {MONTHS_2026[currentMonthIndex].slice(0, 3)}
                </span>
                <button
                  disabled={currentMonthIndex === 11}
                  onClick={() => setCurrentMonthIndex((prev) => Math.min(11, prev + 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition text-white font-bold"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Días semana */}
            <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold tracking-wider text-neutral-400 mb-3 font-editorial-bold">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="truncate px-1">{d}</div>
              ))}
            </div>

            {/* Matriz de Días */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="h-14 sm:h-16 rounded-2xl bg-white/[0.02]" />
              ))}

              {days.map((day) => {
                const dayData = getDayData(day);
                const isSelected = selectedDayNumber === day;
                const hasFreeSlots = dayData.isOpen && dayData.slots.some((s) => !s.bookedBy);

                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDayNumber(day);
                      setSelectedSlotId(null);
                    }}
                    className={`relative h-14 sm:h-16 rounded-2xl border flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all outline-none ${
                      isSelected
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/50 scale-[1.03] z-10 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                        : hasFreeSlots
                        ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/40 text-neutral-100'
                        : 'bg-red-950/20 border-red-500/20 hover:bg-red-950/30 opacity-60 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold font-editorial-bold text-white">{day}</span>

                    <span
                      className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider w-full truncate text-center ${
                        hasFreeSlots
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {hasFreeSlots ? 'Libre' : 'Lleno'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: INTERACCIÓN Y WHATSAPP */}
        <div className="lg:col-span-4 bg-[#14171d]/90 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-sky-400 font-bold block">
                  {viewMode === 'user' ? 'Confirmación WhatsApp' : 'Panel de Administración'}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white font-editorial-bold">
                  {selectedLeader.name}
                </h4>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-sky-950/50 border border-sky-500/30 flex flex-col items-center justify-center font-bold">
                <span className="text-[10px] leading-none text-sky-400 uppercase">
                  {MONTHS_2026[currentMonthIndex].slice(0, 3)}
                </span>
                <span className="text-sm leading-none text-white font-editorial-bold mt-0.5">
                  {selectedDayNumber}
                </span>
              </div>
            </div>

            {/* MODO LÍDER */}
            {viewMode === 'leader' ? (
              <div className="space-y-4">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Estado del día</span>
                    <span className="text-[11px] text-neutral-400">
                      {currentDayData.isOpen ? 'Habilitado (Verde)' : 'Bloqueado (Rojo)'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleDayOpen}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                      currentDayData.isOpen
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    {currentDayData.isOpen ? 'Bloquear Día' : 'Habilitar Día'}
                  </button>
                </div>

                <form onSubmit={handleAddSlot} className="flex gap-2">
                  <input
                    type="text"
                    value={newTimeInput}
                    onChange={(e) => setNewTimeInput(e.target.value)}
                    placeholder="Ej. 04:30 PM"
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-neutral-950 font-bold text-xs rounded-xl transition shadow-sm"
                  >
                    + Añadir
                  </button>
                </form>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Horarios configurados:
                  </span>
                  {currentDayData.slots.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic py-2">No hay horarios creados para este día.</p>
                  ) : (
                    currentDayData.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                      >
                        <div>
                          <span className="font-bold block text-white">{slot.time}</span>
                          <span className="text-[10px] text-neutral-400">
                            {slot.bookedBy ? `Reservado: ${slot.bookedBy} (${slot.phone})` : 'Libre para agendar'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20"
                          title="Eliminar este horario"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* MODO USUARIO */
              <div className="space-y-4">
                {currentDayData.isOpen && currentDayData.slots.some((s) => !s.bookedBy) ? (
                  <>
                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-2 font-bold uppercase tracking-wider">
                        1. Selecciona un horario disponible:
                      </span>
                      <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {currentDayData.slots.map((slot) => {
                          const isBooked = !!slot.bookedBy;
                          const isSelected = selectedSlotId === slot.id;

                          return (
                            <button
                              key={slot.id}
                              disabled={isBooked}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                                isBooked
                                  ? 'opacity-30 bg-white/[0.02] border-white/5 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-sky-400 text-neutral-950 font-bold border-sky-400 shadow-md'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                              }`}
                            >
                              <span className="font-bold">{slot.time}</span>
                              <span className={`text-[9px] ${isSelected ? 'text-neutral-900 font-semibold' : 'text-neutral-400'}`}>
                                {isBooked ? 'Ocupado' : 'Disponible'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1.5 font-bold uppercase tracking-wider">
                        2. Elige la modalidad:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setSelectedModality('church')}
                          className={`py-1.5 rounded-lg text-center font-medium transition ${
                            selectedModality === 'church'
                              ? 'bg-sky-400 text-neutral-950 font-bold shadow-xs'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          🏛 Iglesia
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedModality('cafe')}
                          className={`py-1.5 rounded-lg text-center font-medium transition ${
                            selectedModality === 'cafe'
                              ? 'bg-sky-400 text-neutral-950 font-bold shadow-xs'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          ☕ Café
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedModality('virtual')}
                          className={`py-1.5 rounded-lg text-center font-medium transition ${
                            selectedModality === 'virtual'
                              ? 'bg-sky-400 text-neutral-950 font-bold shadow-xs'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          💻 Virtual
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 block mb-1 font-bold uppercase tracking-wider">
                        3. Tus Datos para WhatsApp:
                      </span>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Tu Nombre Completo"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400"
                        />
                        <input
                          type="tel"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          placeholder="Tu WhatsApp (ej: 3001234567)"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs text-neutral-300 font-medium">
                      Este día no tiene horarios disponibles.
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Por favor selecciona otro día marcado en color verde.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTONES AZUL BABY */}
          {viewMode === 'user' && (
            <div className="pt-4 border-t border-white/10 mt-4">
              {bookingSuccess ? (
                <div className="space-y-2 animate-in zoom-in-95">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-bold">
                    ✓ ¡Cita agendada! Notificando a los líderes...
                  </div>
                  <button
                    onClick={handleSendToUserWhatsApp}
                    className="w-full py-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-400/40 text-sky-300 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>📲</span> Enviar Confirmación a mi propio WhatsApp
                  </button>
                </div>
              ) : (
                <button
                  disabled={!selectedSlotId || !userName.trim() || !userPhone.trim() || !currentDayData.isOpen}
                  onClick={handleBookAppointment}
                  className="w-full py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 font-editorial-bold"
                >
                  Confirmar y Enviar a WhatsApp Líderes →
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}