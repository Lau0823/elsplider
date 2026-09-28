'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// 1. CONFIGURACIÓN DE IMÁGENES EXACTAS
// ==========================================
const SPLASH_BG_IMAGE = 'https://i.pinimg.com/736x/52/96/d7/5296d7d75038c878e9fe279a83eabbff.jpg';
const JESUS_IMAGE_URL = 'https://i.pinimg.com/1200x/d2/b3/f0/d2b3f032df40e23e4083ada49899f7c4.jpg';
const HOME_BG_IMAGE = 'https://i.pinimg.com/736x/49/9f/9c/499f9c29aaa32d7dc3ef14be1eb1de26.jpg';

// Fotos del carrusel a 3/4 de pantalla
const BANNER_IMAGES = [
  'https://i.pinimg.com/736x/49/9f/9c/499f9c29aaa32d7dc3ef14be1eb1de26.jpg',
  'https://i.pinimg.com/1200x/13/6d/09/136d09c272260d30cffa1e97027a241e.jpg',
  'https://i.pinimg.com/736x/e6/9b/d2/e69bd2cb1009df8647ceb1c7267839a2.jpg',
];

// ==========================================
// 2. NÚMERO DE WHATSAPP DONDE LLEGAN TODAS LAS RESERVAS
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
  focusMessage: string;
}

const LEADERS: Leader[] = [
  {
    id: 'male',
    name: 'Líder Male',
    role: 'Acompañamiento & Mujeres',
    photoUrl: '/WhatsApp Image 2026-09-27 at 18.56.25 (2).jpeg',
    focusMessage: 'espacio de acompañamiento femenino, oración y edificación',
  },
  {
    id: 'sebas',
    name: 'Líder Sebas',
    role: 'Jóvenes & Liderazgo',
    photoUrl: '/WhatsApp Image 2026-09-27 at 18.59.15.jpeg',
    focusMessage: 'conversación de liderazgo juvenil, propósito y enfoque espiritual',
  },
  {
    id: 'marce',
    name: 'Líder Marce',
    role: 'Familia & Consejería',
    photoUrl: '/WhatsApp Image 2026-09-27 at 18.56.08 (2).jpeg',
    focusMessage: 'tiempo de consejería familiar, restauración y bendición para el hogar',
  },
];

const MONTHS_2026 = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEK_DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
const WEEK_DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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

  // Carrusel
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Modo: usuario vs líder
  const [viewMode, setViewMode] = useState<'user' | 'leader'>('user');

  // Tipo de vista de calendario: 'week' (por semanas) o 'month' (mes completo)
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [currentWeekIndex, setCurrentWeekIndex] = useState(1);

  // Selección
  const [selectedLeader, setSelectedLeader] = useState<Leader>(LEADERS[0]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // Marzo 2026
  const [expandedDayNumber, setExpandedDayNumber] = useState<number | null>(10);

  // Formulario de reserva
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [selectedModality, setSelectedModality] = useState<'church' | 'cafe' | 'virtual'>('church');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Registro del último agendamiento
  const [lastBooking, setLastBooking] = useState<{
    leader: Leader;
    personName: string;
    personPhone: string;
    date: string;
    time: string;
    modalityText: string;
  } | null>(null);

  // Formulario del líder
  const [newTimeInput, setNewTimeInput] = useState('');

  // ==========================================
  // PERSISTENCIA DE DATOS CON LOCALSTORAGE
  // ==========================================
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

  // 1. Cargar datos guardados previamente al montar
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('church_ministration_agenda_2026');
      if (savedData) {
        setAgendaDB(JSON.parse(savedData));
      }
    } catch (e) {
      console.error('Error al leer de localStorage', e);
    }
  }, []);

  // 2. Guardar automáticamente cada vez que cambie agendaDB
  useEffect(() => {
    try {
      localStorage.setItem('church_ministration_agenda_2026', JSON.stringify(agendaDB));
    } catch (e) {
      console.error('Error al guardar en localStorage', e);
    }
  }, [agendaDB]);

  // Splash timeout
  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFade(true), 1800);
    const removeTimer = setTimeout(() => setShowSplash(false), 2400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Intervalo del carrusel automático (3.5s)
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

  const generateMonthData = (monthIndex: number) => {
    const year = 2026;
    const firstDayIndex = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const blanks = Array.from({ length: firstDayIndex });
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return { blanks, days, totalDays };
  };

  const { blanks, days, totalDays } = generateMonthData(currentMonthIndex);

  const weeks: number[][] = [];
  let tempWeek: number[] = [];
  for (let d = 1; d <= totalDays; d++) {
    tempWeek.push(d);
    if (tempWeek.length === 7 || d === totalDays) {
      weeks.push(tempWeek);
      tempWeek = [];
    }
  }

  const currentWeekDays = weeks[Math.min(currentWeekIndex, weeks.length - 1)] || [];

  // Toggle de día para el líder
  const handleToggleDayOpen = (dayNum: number) => {
    const key = getDayKey(dayNum);
    const existing = getDayData(dayNum);
    setAgendaDB((prev) => ({
      ...prev,
      [key]: {
        ...existing,
        isOpen: !existing.isOpen,
      },
    }));
  };

  // Añadir hora (Líder)
  const handleAddSlot = (dayNum: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeInput.trim()) return;
    const key = getDayKey(dayNum);
    const existing = getDayData(dayNum);

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

  // Eliminar hora (Líder)
  const handleDeleteSlot = (dayNum: number, slotId: string) => {
    const key = getDayKey(dayNum);
    const existing = getDayData(dayNum);
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

  // ========================================================
  // GENERADORES DE MENSAJE DINÁMICOS SEGÚN EL LÍDER
  // ========================================================
  const buildLeaderWhatsAppMessage = (info: {
    leader: Leader;
    personName: string;
    personPhone: string;
    date: string;
    time: string;
    modalityText: string;
  }) => {
    let specificGreeting = `¡Atención equipo pastoral! ✨`;
    let customNote = `Se ha agendado una cita de ministración.`;

    if (info.leader.id === 'male') {
      specificGreeting = `¡Hola Líder Male! 🌸 Tienes una nueva ministración agendada`;
      customNote = `Enfoque: Acompañamiento, oración y corazón pastoral para mujeres.`;
    } else if (info.leader.id === 'sebas') {
      specificGreeting = `¡Hola Líder Sebas! ⚡ Tienes una nueva ministración agendada`;
      customNote = `Enfoque: Discipulado, liderazgo juvenil y visión ministerial.`;
    } else if (info.leader.id === 'marce') {
      specificGreeting = `¡Hola Líder Marce! 🕊️ Tienes una nueva ministración agendada`;
      customNote = `Enfoque: Consejería familiar, edificación y restauración de hogar.`;
    }

    return (
      `${specificGreeting}\n\n` +
      `📌 *Líder a cargo:* ${info.leader.name} (${info.leader.role})\n` +
      `👤 *Persona:* ${info.personName}\n` +
      `📱 *WhatsApp contacto:* ${info.personPhone}\n` +
      `🗓 *Fecha:* ${info.date}\n` +
      `⏰ *Hora:* ${info.time}\n` +
      `📍 *Modalidad:* ${info.modalityText}\n\n` +
      `📖 *Detalle:* ${customNote}\n\n` +
      `¡Notificación enviada al 3102345742!`
    );
  };

  const buildUserWhatsAppMessage = (info: {
    leader: Leader;
    personName: string;
    date: string;
    time: string;
    modalityText: string;
  }) => {
    let personalNote = `Estamos felices de tener este tiempo contigo.`;

    if (info.leader.id === 'male') {
      personalNote = `La *Líder Male* ya está al tanto de tu reserva y orando por este tiempo de edificación y acompañamiento para tu vida.`;
    } else if (info.leader.id === 'sebas') {
      personalNote = `El *Líder Sebas* ya recibió tu solicitud y está entusiasmado de conversar contigo sobre propósito, liderazgo y metas.`;
    } else if (info.leader.id === 'marce') {
      personalNote = `La *Líder Marce* ya tiene agendado tu espacio y cree firmemente que será un tiempo de bendición, sabiduría y dirección para tu familia.`;
    }

    return (
      `¡Hola ${info.personName}! 🌿\n\n` +
      `Tu cita de ministración con *${info.leader.name}* ha quedado confirmada:\n\n` +
      `✝️ *Líder:* ${info.leader.name} (${info.leader.role})\n` +
      `🗓 *Fecha:* ${info.date}\n` +
      `⏰ *Hora:* ${info.time}\n` +
      `📍 *Modalidad:* ${info.modalityText}\n\n` +
      `💬 ${personalNote}\n\n` +
      `¡Te esperamos con el corazón abierto!`
    );
  };

  // Agendar y enviar mensaje directo al 3102345742
  const handleBookAppointment = (dayNum: number) => {
    if (!userName.trim() || !userPhone.trim() || !selectedSlotId) return;
    const key = getDayKey(dayNum);
    const existing = getDayData(dayNum);
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

    const dateFormatted = `${dayNum} de ${MONTHS_2026[currentMonthIndex]} de 2026`;
    const modalityText = getModalityLabel(selectedModality);

    const bookingInfo = {
      leader: selectedLeader,
      personName: userName.trim(),
      personPhone: userPhone.trim().replace(/\D/g, ''),
      date: dateFormatted,
      time: bookedSlot.time,
      modalityText,
    };
    setLastBooking(bookingInfo);
    setBookingSuccess(true);

    // Mensaje personalizado para el líder seleccionado
    const leaderMessage = encodeURIComponent(buildLeaderWhatsAppMessage(bookingInfo));
    window.open(`https://wa.me/${LEADERS_GLOBAL_WHATSAPP}?text=${leaderMessage}`, '_blank');
  };

  // Enviar copia al WhatsApp de quien agenda
  const handleSendToUserWhatsApp = () => {
    if (!lastBooking) return;
    const rawNumber = lastBooking.personPhone.startsWith('57')
      ? lastBooking.personPhone
      : `57${lastBooking.personPhone}`;

    const userMessage = encodeURIComponent(buildUserWhatsAppMessage(lastBooking));
    window.open(`https://wa.me/${rawNumber}?text=${userMessage}`, '_blank');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#080a0d] text-neutral-100 font-sans selection:bg-sky-500/30 overflow-x-hidden">
      
      {/* Tipografías */}
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

      {/* 1. SPLASH SCREEN (JESÚS + CARGANDO) - SIN OVERLAY */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
            splashFade ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: `url(${SPLASH_BG_IMAGE})` }}
          />

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

      {/* 2. HEADER DARK */}
      <header className="w-full px-4 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3 border-b border-white/10 bg-[#080a0d]/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
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

      {/* 3. BANNER CARRUSEL AUTOMÁTICO A 3/4 DE PANTALLA (h-[75vh]) */}
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

        <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-transparent to-[#080a0d]/30 pointer-events-none" />

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

      {/* 4. TÍTULO EDITORIAL CON LÍDERES */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-12 sm:pt-16 pb-4 text-center">
        <span className="text-[11px] uppercase tracking-[0.25em] text-sky-400 font-bold block mb-2 font-editorial-bold">
          Acompañamiento Pastoral 2026
        </span>
        
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
        <div className="flex justify-center items-center gap-6 sm:gap-14 mb-8">
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
                      ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-[#080a0d] shadow-[0_0_15px_rgba(56,189,248,0.35)]'
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

      {/* 5. CALENDARIO CON PERSISTENCIA Y MENSAJE SEGÚN LÍDER */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-16">
        <div className="bg-[#11141a] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
          
          {/* Header del Calendario */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-sky-400 font-bold block mb-1">
                Disponibilidad de {selectedLeader.name}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-editorial-bold">
                {MONTHS_2026[currentMonthIndex]} <span className="font-light text-neutral-500">2026</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1 italic">
                {selectedLeader.focusMessage}
              </p>
            </div>

            {/* Alternador de vista: Semana vs Mes */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-white/5 p-1 rounded-full border border-white/10 text-xs">
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3.5 py-1.5 rounded-full transition font-medium ${
                    calendarView === 'week'
                      ? 'bg-sky-400 text-neutral-950 font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  📅 Por Semana
                </button>
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3.5 py-1.5 rounded-full transition font-medium ${
                    calendarView === 'month'
                      ? 'bg-sky-400 text-neutral-950 font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  🗓️ Mes Completo
                </button>
              </div>

              {/* Botones de navegación */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-full">
                <button
                  disabled={currentMonthIndex === 0 && currentWeekIndex === 0}
                  onClick={() => {
                    if (calendarView === 'week') {
                      if (currentWeekIndex > 0) setCurrentWeekIndex((prev) => prev - 1);
                      else if (currentMonthIndex > 0) {
                        setCurrentMonthIndex((prev) => prev - 1);
                        setCurrentWeekIndex(3);
                      }
                    } else {
                      setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-20 text-white font-bold transition"
                >
                  ‹
                </button>
                <span className="text-xs px-2 font-bold text-white min-w-[70px] text-center">
                  {calendarView === 'week' ? `Semana ${currentWeekIndex + 1}` : MONTHS_2026[currentMonthIndex].slice(0, 3)}
                </span>
                <button
                  disabled={currentMonthIndex === 11 && currentWeekIndex >= weeks.length - 1}
                  onClick={() => {
                    if (calendarView === 'week') {
                      if (currentWeekIndex < weeks.length - 1) setCurrentWeekIndex((prev) => prev + 1);
                      else if (currentMonthIndex < 11) {
                        setCurrentMonthIndex((prev) => prev + 1);
                        setCurrentWeekIndex(0);
                      }
                    } else {
                      setCurrentMonthIndex((prev) => Math.min(11, prev + 1));
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-20 text-white font-bold transition"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* VISTA 1: POR SEMANA */}
          {calendarView === 'week' && (
            <div className="pt-6">
              <span className="text-xs text-neutral-400 block mb-4">
                Toca cualquier día para <strong className="text-sky-400">desplegar los horarios y agendar con {selectedLeader.name}</strong>:
              </span>

              <div className="grid grid-cols-1 gap-3">
                {currentWeekDays.map((dayNum) => {
                  const dayData = getDayData(dayNum);
                  const isExpanded = expandedDayNumber === dayNum;
                  const hasFreeSlots = dayData.isOpen && dayData.slots.some((s) => !s.bookedBy);
                  const dayOfWeek = (new Date(2026, currentMonthIndex, dayNum).getDay() + 6) % 7;

                  return (
                    <div
                      key={dayNum}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? 'border-sky-400 bg-[#161a22] shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-sky-400'
                          : hasFreeSlots
                          ? 'border-emerald-500/30 bg-[#14171d]/90 hover:border-emerald-400/60'
                          : 'border-red-500/20 bg-[#14171d]/40 opacity-70'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedDayNumber(isExpanded ? null : dayNum)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left outline-none"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-editorial-bold transition ${
                              isExpanded
                                ? 'bg-sky-400 text-neutral-950 font-bold'
                                : hasFreeSlots
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-950/40 text-red-300 border border-red-500/30'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold leading-none">
                              {WEEK_DAYS_SHORT[dayOfWeek]}
                            </span>
                            <span className="text-xl font-extrabold leading-tight mt-0.5">
                              {dayNum}
                            </span>
                          </div>

                          <div>
                            <span className="text-sm sm:text-base font-bold text-white block">
                              {WEEK_DAYS[dayOfWeek]} {dayNum} de {MONTHS_2026[currentMonthIndex]}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {hasFreeSlots
                                ? `${dayData.slots.filter((s) => !s.bookedBy).length} horarios disponibles`
                                : 'Sin cupos disponibles para esta fecha'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                              hasFreeSlots
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${hasFreeSlots ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {hasFreeSlots ? 'Disponible' : 'Cerrado'}
                          </span>

                          <span className={`text-sky-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </button>

                      {/* CONTENIDO DESPLEGABLE */}
                      {isExpanded && (
                        <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                          {viewMode === 'leader' ? (
                            <div className="space-y-4 pt-3">
                              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-xs text-neutral-300">
                                  Estado: <strong>{dayData.isOpen ? 'Habilitado (Verde)' : 'Bloqueado (Rojo)'}</strong>
                                </span>
                                <button
                                  onClick={() => handleToggleDayOpen(dayNum)}
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    dayData.isOpen
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {dayData.isOpen ? 'Bloquear Día' : 'Habilitar Día'}
                                </button>
                              </div>

                              <form onSubmit={(e) => handleAddSlot(dayNum, e)} className="flex gap-2">
                                <input
                                  type="text"
                                  value={newTimeInput}
                                  onChange={(e) => setNewTimeInput(e.target.value)}
                                  placeholder="Ej. 04:30 PM"
                                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-neutral-950 font-bold text-xs rounded-xl"
                                >
                                  + Añadir Hora
                                </button>
                              </form>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dayData.slots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                                  >
                                    <div>
                                      <span className="font-bold block text-white">{slot.time}</span>
                                      <span className="text-[10px] text-neutral-400">
                                        {slot.bookedBy ? `Reservado: ${slot.bookedBy} (${slot.phone})` : 'Libre'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteSlot(dayNum, slot.id)}
                                      className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded-lg"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            hasFreeSlots ? (
                              <div className="space-y-4 pt-3">
                                <div>
                                  <span className="text-xs font-bold text-sky-400 block mb-2 uppercase tracking-wider">
                                    1. Elige tu hora con {selectedLeader.name}:
                                  </span>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {dayData.slots.map((slot) => {
                                      const isBooked = !!slot.bookedBy;
                                      const isSelected = selectedSlotId === slot.id;

                                      return (
                                        <button
                                          key={slot.id}
                                          disabled={isBooked}
                                          onClick={() => setSelectedSlotId(slot.id)}
                                          className={`p-3 rounded-xl border text-center transition ${
                                            isBooked
                                              ? 'opacity-30 bg-white/[0.02] border-white/5 cursor-not-allowed'
                                              : isSelected
                                              ? 'bg-sky-400 text-neutral-950 font-bold border-sky-400 shadow-md scale-[1.02]'
                                              : 'bg-white/5 border-white/10 hover:bg-white/15 text-white'
                                          }`}
                                        >
                                          <span className="block font-bold text-sm">{slot.time}</span>
                                          <span className="text-[10px] opacity-75">{isBooked ? 'Ocupado' : 'Disponible'}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Modalidad */}
                                <div>
                                  <span className="text-xs font-bold text-sky-400 block mb-2 uppercase tracking-wider">
                                    2. Modalidad de la cita:
                                  </span>
                                  <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 text-xs">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedModality('church')}
                                      className={`py-2 rounded-lg text-center font-medium transition ${
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
                                      className={`py-2 rounded-lg text-center font-medium transition ${
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
                                      className={`py-2 rounded-lg text-center font-medium transition ${
                                        selectedModality === 'virtual'
                                          ? 'bg-sky-400 text-neutral-950 font-bold shadow-xs'
                                          : 'text-neutral-400 hover:text-white'
                                      }`}
                                    >
                                      💻 Virtual
                                    </button>
                                  </div>
                                </div>

                                {/* Datos */}
                                <div>
                                  <span className="text-xs font-bold text-sky-400 block mb-2 uppercase tracking-wider">
                                    3. Tus Datos para WhatsApp:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      value={userName}
                                      onChange={(e) => setUserName(e.target.value)}
                                      placeholder="Tu Nombre Completo"
                                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400"
                                    />
                                    <input
                                      type="tel"
                                      value={userPhone}
                                      onChange={(e) => setUserPhone(e.target.value)}
                                      placeholder="Tu WhatsApp (ej: 3001234567)"
                                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-400"
                                    />
                                  </div>
                                </div>

                                {/* Botón de confirmación */}
                                <div className="pt-2">
                                  {bookingSuccess ? (
                                    <div className="space-y-2 animate-in zoom-in-95">
                                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-bold">
                                        ✓ ¡Cita reservada con {selectedLeader.name}! Notificando al 3102345742...
                                      </div>
                                      <button
                                        onClick={handleSendToUserWhatsApp}
                                        className="w-full py-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-400/40 text-sky-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
                                      >
                                        <span>📲</span> Enviar comprobante de {selectedLeader.name} a mi WhatsApp
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      disabled={!selectedSlotId || !userName.trim() || !userPhone.trim()}
                                      onClick={() => handleBookAppointment(dayNum)}
                                      className="w-full py-3.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 font-editorial-bold"
                                    >
                                      Agendar cita con {selectedLeader.name} y Enviar a WhatsApp →
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-400 py-3 italic">
                                Este día no tiene horarios disponibles con {selectedLeader.name}. Por favor selecciona otro marcado en verde.
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 2: MES COMPLETO */}
          {calendarView === 'month' && (
            <div className="pt-6">
              <div className="grid grid-cols-7 text-center text-xs font-bold text-neutral-400 mb-3 font-editorial-bold">
                {WEEK_DAYS_SHORT.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {blanks.map((_, i) => (
                  <div key={`blank-${i}`} className="h-16 sm:h-20 rounded-xl bg-white/[0.01]" />
                ))}

                {days.map((dayNum) => {
                  const dayData = getDayData(dayNum);
                  const isExpanded = expandedDayNumber === dayNum;
                  const hasFreeSlots = dayData.isOpen && dayData.slots.some((s) => !s.bookedBy);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setExpandedDayNumber(dayNum);
                        setCalendarView('week');
                        const weekIdx = weeks.findIndex((w) => w.includes(dayNum));
                        if (weekIdx !== -1) setCurrentWeekIndex(weekIdx);
                      }}
                      className={`h-16 sm:h-20 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all outline-none ${
                        isExpanded
                          ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/60 scale-105 z-10'
                          : hasFreeSlots
                          ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/40 text-neutral-100'
                          : 'bg-red-950/20 border-red-500/20 hover:bg-red-950/30 opacity-60 text-neutral-400'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-bold font-editorial-bold text-white">
                        {dayNum}
                      </span>
                      <span
                        className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase w-full truncate ${
                          hasFreeSlots
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {hasFreeSlots ? 'Libre' : 'Lleno'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}