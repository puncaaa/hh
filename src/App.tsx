import React, { useState, useMemo } from 'react'
import { 
  Clock, 
  Phone, 
  Plus, 
  Check, 
  AlertTriangle, 
  MessageCircle, 
  X, 
  Scissors, 
  Trash2, 
  Sparkles, 
  CheckCircle,
  RotateCcw,
  Sparkle,
  Calendar,
  Info
} from 'lucide-react'

// Define interfaces for bookings and masters
interface Booking {
  id: string
  masterId: string
  clientName: string
  phone: string
  time: string // e.g., "10:00"
  date: string // e.g., "2026-06-29"
  duration: number // duration in hours (e.g., 0.5, 1, 1.5, 2, 3)
  service: string
  status: 'open' | 'unconfirmed' | 'confirmed'
}

interface Master {
  id: string
  name: string
  role: string
  avatar: string
  color: string
  borderColor: string
  bgColor: string
  textColor: string
  accentColor: string
}

// Fixed list of masters in Russian
const MASTERS: Master[] = [
  { 
    id: 'master1', 
    name: 'Аида', 
    role: 'Стилист по волосам', 
    avatar: '👩🏻‍🦰',
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    accentColor: 'purple'
  },
  { 
    id: 'master2', 
    name: 'Бэлла', 
    role: 'Мастер маникюра', 
    avatar: '💅🏻',
    color: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-200',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    accentColor: 'pink'
  },
  { 
    id: 'master3', 
    name: 'Клара', 
    role: 'Визажист', 
    avatar: '💄',
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    accentColor: 'amber'
  }
]

// Available dates in prototype
const DATES = [
  { value: '2026-06-29', label: 'Пн, 29 июня', shortLabel: '29 июня', relativeLabel: 'Сегодня' },
  { value: '2026-06-30', label: 'Вт, 30 июня', shortLabel: '30 июня', relativeLabel: 'Завтра' },
  { value: '2026-07-01', label: 'Ср, 1 июля', shortLabel: '1 июля', relativeLabel: 'Послезавтра' }
]

// Working hours from 09:00 to 20:00
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
]

// Pre-defined services in Russian
const SERVICES = [
  'Стрижка и укладка',
  'Окрашивание волос',
  'Кератиновое выпрямление',
  'Маникюр гель-лак',
  'Педикюр',
  'Дизайн ногтей',
  'Свадебный макияж',
  'Вечерний макияж',
  'Оформление бровей'
]

// Helper functions for time calculations
const timeToFloat = (t: string): number => {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

const floatToTime = (f: number): string => {
  const h = Math.floor(f)
  const m = Math.round((f - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const checkOverlap = (b1Start: number, b1Dur: number, b2Start: number, b2Dur: number): boolean => {
  return Math.max(b1Start, b2Start) < Math.min(b1Start + b1Dur, b2Start + b2Dur)
}

export default function App() {
  // --- STATE ---
  const [selectedMasterId, setSelectedMasterId] = useState<string>('master1')
  const [adminDate, setAdminDate] = useState<string>('2026-06-29')
  const [bookings, setBookings] = useState<Booking[]>([
    // --- Пн, 29 июня (Сегодня) ---
    // Master 1 (Аида):
    { id: '1', masterId: 'master1', clientName: 'Амина Каримова', phone: '+7 701 123 4567', time: '10:00', date: '2026-06-29', duration: 1.5, service: 'Стрижка и укладка', status: 'confirmed' },
    { id: '2', masterId: 'master1', clientName: 'Алия Смакова', phone: '+7 707 333 2211', time: '10:00', date: '2026-06-29', duration: 3, service: 'Кератиновое выпрямление', status: 'confirmed' }, // Conflict!
    { id: '3', masterId: 'master1', clientName: 'Мадина Асланова', phone: '+7 702 987 6543', time: '11:00', date: '2026-06-29', duration: 2, service: 'Окрашивание волос', status: 'unconfirmed' }, // Unconfirmed
    { id: '4', masterId: 'master1', clientName: 'Дана Байжанова', phone: '+7 705 555 4433', time: '14:00', date: '2026-06-29', duration: 1, service: 'Стрижка и укладка', status: 'confirmed' },
    
    // Master 2 (Бэлла):
    { id: '5', masterId: 'master2', clientName: 'Зарина Ахметова', phone: '+7 777 111 2233', time: '12:00', date: '2026-06-29', duration: 1.5, service: 'Маникюр гель-лак', status: 'confirmed' },
    { id: '6', masterId: 'master2', clientName: 'Юлия Ким', phone: '+7 707 999 8877', time: '15:00', date: '2026-06-29', duration: 2, service: 'Дизайн ногтей', status: 'unconfirmed' },

    // Master 3 (Клара):
    { id: '7', masterId: 'master3', clientName: 'Елена Петрова', phone: '+7 700 333 4455', time: '09:00', date: '2026-06-29', duration: 3, service: 'Свадебный макияж', status: 'confirmed' },
    { id: '8', masterId: 'master3', clientName: 'Нургуль Сабырова', phone: '+7 708 666 7788', time: '11:00', date: '2026-06-29', duration: 1.5, service: 'Вечерний макияж', status: 'confirmed' },
    { id: '9', masterId: 'master3', clientName: 'Камилла Нурпеисова', phone: '+7 701 888 9900', time: '16:00', date: '2026-06-29', duration: 1, service: 'Оформление бровей', status: 'unconfirmed' },

    // --- Вт, 30 июня (Завтра) ---
    { id: '10', masterId: 'master1', clientName: 'Гульназ Садыкова', phone: '+7 701 999 8888', time: '09:00', date: '2026-06-30', duration: 2, service: 'Окрашивание волос', status: 'confirmed' },
    { id: '11', masterId: 'master2', clientName: 'Жанар Тусупова', phone: '+7 702 444 5555', time: '13:00', date: '2026-06-30', duration: 1.5, service: 'Маникюр гель-лак', status: 'unconfirmed' },

    // --- Ср, 1 июля (Послезавтра) ---
    { id: '12', masterId: 'master3', clientName: 'Айнур Ахметова', phone: '+7 705 777 8888', time: '10:00', date: '2026-07-01', duration: 1.5, service: 'Вечерний макияж', status: 'confirmed' },
  ])

  // UI state
  const [mobileView, setMobileView] = useState<'admin' | 'client'>('admin')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [reminderTarget, setReminderTarget] = useState<Booking | null>(null)
  const [lastDeletedBooking, setLastDeletedBooking] = useState<Booking | null>(null)
  const [recentlyFreedSlot, setRecentlyFreedSlot] = useState<{ masterId: string; time: string; date: string } | null>(null)
  
  // Toast notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' | 'undo' }[]>([])

  // Aigerim Form state
  const [formClientName, setFormClientName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formTime, setFormTime] = useState('09:00')
  const [formDate, setFormDate] = useState('2026-06-29')
  const [formDuration, setFormDuration] = useState<number>(1.0)
  const [formService, setFormService] = useState('')
  const [formMasterId, setFormMasterId] = useState('master1')
  const [overrideConflict, setOverrideConflict] = useState(false)

  // Client Portal State
  const [clientTab, setClientTab] = useState<'book' | 'my-booking'>('book')
  const [clientMasterId, setClientMasterId] = useState('master1')
  const [clientSelectedDate, setClientSelectedDate] = useState<string>('2026-06-29')
  const [clientTime, setClientTime] = useState('09:00')
  const [clientDuration, setClientDuration] = useState<number>(1.0)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientService, setClientService] = useState('')

  // Add a toast notification helper
  const addToast = (message: string, type: 'success' | 'info' | 'error' | 'undo' = 'success') => {
    const id = Date.now().toString()
    setToasts((prev) => prev.filter(t => t.type !== 'undo'))
    setToasts((prev) => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, type === 'undo' ? 6000 : 4000)
  }

  // Active Master details
  const activeMaster = useMemo(() => {
    return MASTERS.find(m => m.id === selectedMasterId) || MASTERS[0]
  }, [selectedMasterId])

  // Active Admin Date Details
  const adminDateObj = useMemo(() => {
    return DATES.find(d => d.value === adminDate) || DATES[0]
  }, [adminDate])

  // Bookings grouped by starting time and continuing time for the timeline (Aigerim view)
  const timelineData = useMemo(() => {
    const data: Record<string, { started: Booking[]; continuing: Booking[] }> = {}
    
    TIME_SLOTS.forEach(slot => {
      data[slot] = { started: [], continuing: [] }
    })

    bookings
      .filter(b => b.masterId === selectedMasterId && b.date === adminDate)
      .forEach(b => {
        const bStart = timeToFloat(b.time)
        
        TIME_SLOTS.forEach(slot => {
          const slotVal = timeToFloat(slot)
          if (b.time === slot) {
            data[slot].started.push(b)
          } else if (bStart < slotVal && bStart + b.duration > slotVal) {
            data[slot].continuing.push(b)
          }
        })
      })

    return data
  }, [bookings, selectedMasterId, adminDate])

  // Total daily stats for Aigerim's dashboard on the selected date
  const stats = useMemo(() => {
    const masterBookings = bookings.filter(b => b.masterId === selectedMasterId && b.date === adminDate)
    const confirmedCount = masterBookings.filter(b => b.status === 'confirmed').length
    const unconfirmedCount = masterBookings.filter(b => b.status === 'unconfirmed').length
    
    // Count unique occupied hours
    const occupiedSlots = new Set<string>()
    masterBookings.forEach(b => {
      const bStart = timeToFloat(b.time)
      TIME_SLOTS.forEach(slot => {
        const slotVal = timeToFloat(slot)
        if (bStart <= slotVal && bStart + b.duration > slotVal) {
          occupiedSlots.add(slot)
        }
      })
    })

    const openSlotsCount = TIME_SLOTS.length - occupiedSlots.size
    
    // Check if any slot has more than 1 started booking or is overlapping
    const hasConflicts = Object.values(timelineData).some(
      t => (t.started.length > 1) || (t.started.length > 0 && t.continuing.length > 0)
    )
    
    return {
      confirmed: confirmedCount,
      unconfirmed: unconfirmedCount,
      open: Math.max(0, openSlotsCount),
      hasConflicts
    }
  }, [bookings, selectedMasterId, adminDate, timelineData])

  // Check live conflict during Aigerim Form filling (Date aware)
  const liveConflicts = useMemo(() => {
    if (!formTime || !formMasterId || !formDate) return []
    const formStart = timeToFloat(formTime)
    
    return bookings.filter(b => {
      if (b.masterId !== formMasterId || b.date !== formDate) return false
      const bStart = timeToFloat(b.time)
      return checkOverlap(formStart, formDuration, bStart, b.duration)
    })
  }, [bookings, formTime, formMasterId, formDuration, formDate])

  const hasLiveConflict = liveConflicts.length > 0

  // Filter time slots that are completely free for the Client online booking dropdown (Date and Duration aware)
  const clientAvailableSlots = useMemo(() => {
    return TIME_SLOTS.filter(slot => {
      const slotVal = timeToFloat(slot)
      return !bookings.some(b => {
        if (b.masterId !== clientMasterId || b.date !== clientSelectedDate) return false
        const bStart = timeToFloat(b.time)
        return checkOverlap(slotVal, clientDuration, bStart, b.duration)
      })
    })
  }, [bookings, clientMasterId, clientDuration, clientSelectedDate])

  // List of all unconfirmed (pending) bookings to confirm from the Client's perspective
  const pendingBookingsForClient = useMemo(() => {
    return bookings.filter(b => b.status === 'unconfirmed')
  }, [bookings])


  // Open Aigerim add modal and preset the master, active date, and optional time
  const handleOpenAddModal = (presetTime?: string) => {
    setFormMasterId(selectedMasterId)
    setFormTime(presetTime || '12:00')
    setFormDate(adminDate)
    setFormDuration(1.0)
    setFormClientName('')
    setFormPhone('')
    setFormService('')
    setOverrideConflict(false)
    setIsAddModalOpen(true)
  }

  // Handle Aigerim saving new booking
  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formClientName.trim()) {
      addToast('Пожалуйста, введите имя клиента', 'error')
      return
    }

    if (hasLiveConflict && !overrideConflict) {
      setOverrideConflict(true)
      addToast('Обнаружен конфликт времени. Нажмите сохранить ещё раз для подтверждения.', 'info')
      return
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      masterId: formMasterId,
      clientName: formClientName,
      phone: formPhone || '+7 707 000 0000',
      time: formTime,
      date: formDate,
      duration: formDuration,
      service: formService || 'Услуга салона',
      status: 'unconfirmed'
    }

    setBookings(prev => [...prev, newBooking])
    setIsAddModalOpen(false)
    setSelectedMasterId(formMasterId)
    setAdminDate(formDate) // automatically jump to that date to see it!
    
    addToast(
      hasLiveConflict 
        ? `Двойное бронирование сохранено для ${formClientName} на ${formTime}!` 
        : `Клиент ${formClientName} успешно записан на ${formTime}!`, 
      hasLiveConflict ? 'info' : 'success'
    )
  }

  // Handle Client Online Booking submission
  const handleClientBookOnline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) {
      addToast('Введите имя для записи', 'error')
      return
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      masterId: clientMasterId,
      clientName: clientName,
      phone: clientPhone || '+7 777 000 0000',
      time: clientTime,
      date: clientSelectedDate,
      duration: clientDuration,
      service: clientService || 'Консультация',
      status: 'unconfirmed'
    }

    setBookings(prev => [...prev, newBooking])
    setClientName('')
    setClientPhone('')
    setClientService('')
    
    addToast(`Заявка отправлена! Запись на ${clientTime} добавлена в блокнот салона.`, 'success')
    setClientTab('my-booking')
  }

  // Handle Client confirming their appointment directly from the portal (Persistent in list)
  const handleClientConfirmVisit = (id: string, name: string) => {
    setBookings(prev => prev.map(b => 
      b.id === id 
        ? { ...b, status: 'confirmed' } 
        : b
    ))
    addToast(`Клиент ${name} подтвердил визит через личный кабинет!`, 'success')
  }

  // Trigger WhatsApp reminder modal (Aigerim view)
  const handleTriggerReminder = (booking: Booking) => {
    setReminderTarget(booking)
    setIsReminderModalOpen(true)
  }

  // Confirm WhatsApp simulation (Aigerim view)
  const handleSendReminderConfirm = () => {
    if (!reminderTarget) return

    setBookings(prev => prev.map(b => 
      b.id === reminderTarget.id 
        ? { ...b, status: 'confirmed' } 
        : b
    ))

    setIsReminderModalOpen(false)
    addToast(`Статус записи ${reminderTarget.clientName} изменен на «Подтверждено»`, 'success')
    setReminderTarget(null)
  }

  // Delete booking with Toast undo action and visual freed highlight
  const handleDeleteBooking = (id: string, name: string) => {
    const bookingToDelete = bookings.find(b => b.id === id)
    if (bookingToDelete) {
      setLastDeletedBooking(bookingToDelete)
      setBookings(prev => prev.filter(b => b.id !== id))
      
      // Set the freed slot state to trigger the visual green glow
      setRecentlyFreedSlot({ 
        masterId: bookingToDelete.masterId, 
        time: bookingToDelete.time, 
        date: bookingToDelete.date 
      })
      
      // Clear the visual highlight after 5 seconds
      setTimeout(() => {
        setRecentlyFreedSlot(prev => 
          prev && prev.masterId === bookingToDelete.masterId && prev.time === bookingToDelete.time && prev.date === bookingToDelete.date
            ? null 
            : prev
        )
      }, 5000)

      addToast(`Запись ${name} отменена.`, 'undo')
    }
  }

  // Restore deleted booking
  const handleUndoDelete = () => {
    if (lastDeletedBooking) {
      setBookings(prev => [...prev, lastDeletedBooking])
      addToast(`Запись ${lastDeletedBooking.clientName} успешно восстановлена!`, 'success')
      setLastDeletedBooking(null)
      setRecentlyFreedSlot(null) // clear visual glow since slot is occupied again
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 lg:p-8">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-slide-up pointer-events-auto transition-all ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 
              toast.type === 'error' ? 'bg-rose-600 text-white' : 
              toast.type === 'undo' ? 'bg-slate-900 text-white border border-slate-800' :
              'bg-amber-500 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <AlertTriangle size={18} />}
              {toast.type === 'undo' && <RotateCcw size={18} className="text-amber-400" />}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            
            {toast.type === 'undo' && (
              <button 
                onClick={handleUndoDelete}
                className="ml-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold py-1.5 px-3 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Вернуть
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Main Title Header (Desktop) */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between mb-5 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-850 tracking-tight text-center md:text-left flex items-center gap-2">
            <Sparkle className="text-amber-500 fill-amber-500 animate-spin" size={24} style={{ animationDuration: '4s' }} /> 
            Интерактивный Прототип Записи
          </h1>
          <p className="text-xs font-semibold text-slate-500 text-center md:text-left mt-1">
            Слева — панель владелицы салона Айгерим. Справа — портал клиента. Изменения видны мгновенно!
          </p>
        </div>
        
        {/* Toggle Switcher for Mobile */}
        <div className="flex md:hidden bg-slate-200 p-1.5 rounded-2xl shadow-inner border border-slate-300">
          <button 
            onClick={() => setMobileView('admin')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${mobileView === 'admin' ? 'bg-white text-slate-900 shadow-md font-black' : 'text-slate-500'}`}
          >
            Блокнот Айгерим
          </button>
          <button 
            onClick={() => setMobileView('client')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${mobileView === 'client' ? 'bg-white text-slate-900 shadow-md font-black' : 'text-slate-500'}`}
          >
            Клиентский портал
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-center">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: AIGERIM'S DAILY SHEET (ADMIN PANEL)        */}
        {/* ======================================================== */}
        <div className={`${mobileView === 'admin' ? 'block' : 'hidden md:block'} flex justify-center`}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-250 flex flex-col relative min-h-[820px] max-h-[850px]">
            
            {/* Mock Phone Status Bar */}
            <div className="bg-slate-900 text-white px-6 py-2.5 flex justify-between items-center text-xs font-semibold select-none">
              <span>15:50</span>
              <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <span className="opacity-80">LTE</span>
                <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                  <div className="w-3.5 h-full bg-white rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* Dashboard Header */}
            <header className="px-5 pt-4 pb-3 border-b border-slate-100 bg-white sticky top-0 z-20">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Блокнот Айгерим</p>
                  <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    {adminDateObj.relativeLabel} <span className="text-sm font-semibold text-slate-400">{adminDateObj.shortLabel}</span>
                  </h1>
                </div>
                
                {/* Quick stats indicators */}
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1" title="Подтвержденные записи">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-black text-slate-700">{stats.confirmed}</span>
                  </div>
                  <div className="w-[1px] h-3 bg-slate-200"></div>
                  <div className="flex items-center gap-1" title="Неподтвержденные записи">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-black text-slate-700">{stats.unconfirmed}</span>
                  </div>
                  {stats.hasConflicts && (
                    <>
                      <div className="w-[1px] h-3 bg-slate-200"></div>
                      <div className="flex items-center gap-1 text-rose-500 animate-pulse" title="Обнаружено наложение записей">
                        <AlertTriangle size={13} />
                        <span className="text-[10px] font-black uppercase">Конфликт</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* DATE SELECTOR (ADMIN VIEW) */}
              <div className="flex gap-2 mb-3 bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner">
                {DATES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setAdminDate(d.value)}
                    className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      adminDate === d.value 
                        ? 'bg-slate-900 text-white shadow-md font-black scale-100' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="block text-[8px] opacity-75 leading-none">{d.relativeLabel}</span>
                    <span className="text-[10px] leading-tight">{d.shortLabel}</span>
                  </button>
                ))}
              </div>

              {/* Premium segmented control for switching masters */}
              <div className="p-1 bg-slate-100 rounded-2xl flex gap-1 shadow-inner">
                {MASTERS.map((master) => {
                  const isActive = selectedMasterId === master.id
                  const count = bookings.filter(b => b.masterId === master.id && b.date === adminDate).length
                  return (
                    <button
                      key={master.id}
                      onClick={() => setSelectedMasterId(master.id)}
                      className={`flex-1 py-2 px-0.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer ${
                        isActive 
                          ? 'bg-white text-slate-900 shadow-md scale-100 font-bold' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-base">{master.avatar}</span>
                        <span className="text-xs font-extrabold tracking-tight">{master.name}</span>
                      </div>
                      <span className="text-[9px] opacity-75 font-semibold mt-0.5">{master.role.split(' ')[0]}</span>
                      {count > 0 && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm bg-gradient-to-tr ${master.color}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </header>

            {/* Scrollable Timeline */}
            <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar pb-24 max-h-[580px]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Расписание — {activeMaster.name} ({activeMaster.role})
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  Свободных окон: {stats.open}
                </span>
              </div>

              <div className="space-y-3 relative border-l border-slate-200/60 ml-12 pl-6">
                {TIME_SLOTS.map((slot) => {
                  const { started, continuing } = timelineData[slot]
                  const hasBookings = started.length > 0 || continuing.length > 0
                  const isConflict = (started.length > 1) || (started.length > 0 && continuing.length > 0)
                  
                  // Check if this specific slot was recently freed
                  const isJustFreed = recentlyFreedSlot && 
                                      recentlyFreedSlot.masterId === selectedMasterId && 
                                      recentlyFreedSlot.time === slot && 
                                      recentlyFreedSlot.date === adminDate

                  return (
                    <div key={slot} className="relative group transition-all">
                      {/* Timeline Hour Marker Dot */}
                      <div className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all ${
                        isConflict ? 'border-rose-500 bg-rose-50' :
                        (started.length > 0 && started[0].status === 'confirmed') || (continuing.length > 0 && continuing[0].status === 'confirmed')
                          ? 'border-emerald-500' 
                          : hasBookings ? 'border-amber-400' : 'border-slate-300'
                      }`} />
                      
                      {/* Hour text on the side */}
                      <div className="absolute -left-[76px] top-3.5 w-12 text-right">
                        <span className="text-xs font-extrabold text-slate-500">{slot}</span>
                      </div>

                      {/* Slot Cards Container */}
                      <div className="space-y-2">
                        {/* Conflict header if double-booked */}
                        {isConflict && (
                          <div className="bg-rose-50 text-rose-800 text-[10px] px-2.5 py-1 rounded-xl border border-rose-200/55 flex items-center gap-1 font-bold animate-pulse">
                            <AlertTriangle size={12} className="text-rose-500" />
                            Наложение времени! Мастер перегружен(а).
                          </div>
                        )}

                        {/* 1. Render started bookings at this slot */}
                        {started.map((booking) => {
                          const isConfirmed = booking.status === 'confirmed'
                          const startFloat = timeToFloat(booking.time)
                          const endFloat = startFloat + booking.duration
                          const formattedEndTime = floatToTime(endFloat)
                          
                          return (
                            <div
                              key={booking.id}
                              className={`p-4 rounded-2xl border shadow-2xs transition-all relative ${
                                isConflict 
                                  ? 'bg-rose-50/60 border-rose-200 text-slate-900 shadow-md' 
                                  : isConfirmed
                                    ? 'bg-emerald-50/40 border-emerald-100 text-slate-800'
                                    : 'bg-amber-50/40 border-amber-100 text-slate-800'
                              }`}
                            >
                              {/* Card Header */}
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-[15px] leading-tight flex flex-wrap items-center gap-1.5">
                                    {booking.clientName}
                                    {isConfirmed ? (
                                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px]" title="Запись подтверждена">
                                        <Check size={10} strokeWidth={3} />
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider" title="Ожидает подтверждения">
                                        Ожидает
                                      </span>
                                    )}
                                  </h4>
                                  
                                  {/* Service Name & Time Range */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="text-xs opacity-80 font-semibold flex items-center gap-1">
                                      <Scissors size={11} className="opacity-60 text-slate-500" /> {booking.service}
                                    </span>
                                    <span className="text-[10px] font-black bg-slate-100/90 text-slate-650 px-1.5 py-0.5 rounded-md">
                                      ⏱️ {booking.time} - {formattedEndTime} ({booking.duration === 0.5 ? '30м' : `${booking.duration}ч`})
                                    </span>
                                  </div>

                                  {/* Explicit Client Status Label (User request) */}
                                  <div className="mt-2 flex items-center gap-1">
                                    {isConfirmed ? (
                                      <span className="text-[10px] font-extrabold text-emerald-650 bg-emerald-100/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <CheckCircle size={10} /> Подтверждено клиентом
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <AlertTriangle size={10} /> Требуется подтверждение
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleDeleteBooking(booking.id, booking.clientName)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors rounded-lg hover:bg-white cursor-pointer shrink-0"
                                  title="Отменить запись"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {/* Card Footer (Phone & Action) */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/30">
                                <span className="text-xs font-semibold opacity-85 flex items-center gap-1">
                                  <Phone size={12} className="opacity-60 text-slate-500" /> {booking.phone}
                                </span>

                                {/* One-click WhatsApp Reminder for unconfirmed bookings */}
                                {!isConfirmed && (
                                  <button
                                    onClick={() => handleTriggerReminder(booking)}
                                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-1.5 px-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                                  >
                                    <MessageCircle size={13} fill="currentColor" className="text-slate-950" />
                                    <span>Напомнить</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* 2. Render continuing bookings */}
                        {continuing.map((booking) => {
                          const isConfirmed = booking.status === 'confirmed'
                          const endTimeStr = floatToTime(timeToFloat(booking.time) + booking.duration)
                          return (
                            <div
                              key={`cont-${booking.id}-${slot}`}
                              className={`p-2.5 rounded-xl border border-dashed text-xs flex items-center justify-between transition-all ${
                                isConfirmed 
                                  ? 'bg-emerald-50/20 border-emerald-200 text-emerald-800' 
                                  : 'bg-amber-50/20 border-amber-200 text-amber-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-medium">
                                <Clock size={12} className="opacity-70 text-slate-500" />
                                <span>
                                  Мастер занят(а): <strong>{booking.clientName}</strong> (до {endTimeStr})
                                </span>
                              </div>
                              <span className="text-[9px] uppercase font-black opacity-60 tracking-wider">
                                Занято
                              </span>
                            </div>
                          )
                        })}

                        {/* 3. Render Empty / Open slot if no started/continuing bookings */}
                        {!hasBookings && (
                          isJustFreed ? (
                            /* RECENTLY FREED GLOWING SLOT */
                            <button
                              onClick={() => handleOpenAddModal(slot)}
                              className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/40 text-emerald-800 transition-all text-left group/btn cursor-pointer animate-pulse"
                              title="Это окно только что освободилось!"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-emerald-600" />
                                <span className="text-xs font-black uppercase tracking-wider text-emerald-700">✨ Свободно! Окно освободилось</span>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                <Plus size={14} />
                              </div>
                            </button>
                          ) : (
                            /* STANDARD OPEN SLOT */
                            <button
                              onClick={() => handleOpenAddModal(slot)}
                              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 transition-all text-left text-slate-400 group/btn cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-slate-300 group-hover/btn:text-slate-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Свободное время</span>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/btn:bg-slate-900 group-hover/btn:text-white transition-all shadow-2xs">
                                <Plus size={14} />
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </main>

            {/* Floating Add Appointment FAB */}
            <button
              onClick={() => handleOpenAddModal()}
              className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all z-30 cursor-pointer"
              title="Добавить запись"
            >
              <Plus size={28} />
            </button>

            {/* --- INTERACTIVE: QUICK ADD BOTTOM SHEET / MODAL --- */}
            {isAddModalOpen && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex items-end justify-center rounded-3xl overflow-hidden animate-fade-in">
                {/* Modal backdrop tap to close */}
                <div className="absolute inset-0" onClick={() => setIsAddModalOpen(false)}></div>
                
                {/* Slide up sheet */}
                <div className="w-full bg-white rounded-t-3xl shadow-xl z-50 p-6 animate-slide-up border-t border-slate-100 flex flex-col max-h-[90%] overflow-y-auto">
                  
                  {/* Drag Indicator Bar */}
                  <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5"></div>
                  
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Новая запись</h3>
                      <p className="text-xs text-slate-400">Быстрое добавление клиента в журнал</p>
                    </div>
                    <button 
                      onClick={() => setIsAddModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBooking} className="space-y-4 text-left">
                    {/* Master Select Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Специалист</label>
                      <div className="grid grid-cols-3 gap-2">
                        {MASTERS.map(m => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => {
                              setFormMasterId(m.id)
                              setOverrideConflict(false)
                            }}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              formMasterId === m.id 
                                ? `border-slate-900 bg-slate-900 text-white font-extrabold shadow-sm` 
                                : 'border-slate-200 text-slate-655 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-[11px] block">{m.avatar} {m.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date select for booking */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Дата визита</label>
                      <select
                        value={formDate}
                        onChange={(e) => {
                          setFormDate(e.target.value)
                          setOverrideConflict(false)
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                      >
                        {DATES.map(d => (
                          <option key={d.value} value={d.value}>{d.label} ({d.relativeLabel})</option>
                        ))}
                      </select>
                    </div>

                    {/* Time & Duration row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Время начала</label>
                        <select
                          value={formTime}
                          onChange={(e) => {
                            setFormTime(e.target.value)
                            setOverrideConflict(false)
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                        >
                          {TIME_SLOTS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Телефон</label>
                        <input
                          type="tel"
                          placeholder="+7 707..."
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-850 focus:outline-none focus:border-slate-900 font-semibold"
                        />
                      </div>
                    </div>

                    {/* SELECT DURATION PILLS */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Длительность услуги</label>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { label: '30м', value: 0.5 },
                          { label: '1ч', value: 1.0 },
                          { label: '1.5ч', value: 1.5 },
                          { label: '2ч', value: 2.0 },
                          { label: '3ч', value: 3.0 },
                        ].map(d => (
                          <button
                            type="button"
                            key={d.value}
                            onClick={() => {
                              setFormDuration(d.value)
                              setOverrideConflict(false)
                            }}
                            className={`py-2 px-0.5 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                              formDuration === d.value 
                                ? `border-slate-900 bg-slate-900 text-white font-black` 
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-655'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Имя клиента *</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: Аида Касымова"
                        value={formClientName}
                        onChange={(e) => setFormClientName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-slate-900 font-semibold"
                      />
                    </div>

                    {/* Service Select Chip or Custom input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Услуга</label>
                      <input
                        type="text"
                        placeholder="Введите или выберите услугу ниже"
                        value={formService}
                        onChange={(e) => setFormService(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-slate-900 font-semibold mb-2"
                      />
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {SERVICES.map(srv => (
                          <button
                            type="button"
                            key={srv}
                            onClick={() => setFormService(srv)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              formService === srv
                                ? 'bg-slate-200 border-slate-300 font-bold text-slate-850'
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            {srv}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* EDGE CASE: Live Conflict Alert UI */}
                    {hasLiveConflict && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-250 flex items-start gap-2.5 animate-pulse">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div className="text-xs text-amber-950 font-medium">
                          <span className="font-bold block">⚠️ Конфликт наложения времени</span>
                          Мастер {MASTERS.find(m => m.id === formMasterId)?.name} занят(а) в интервале с {formTime} на {formDuration === 0.5 ? '30м' : `${formDuration}ч`}.
                          <p className="mt-1 font-bold">Занято клиентами:</p>
                          <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[11px]">
                            {liveConflicts.map(c => {
                              const cEnd = floatToTime(timeToFloat(c.time) + c.duration)
                              return (
                                <li key={c.id}>
                                  {c.clientName} ({c.time} - {cEnd}, {c.service})
                                </li>
                              )
                            })}
                          </ul>
                          <p className="mt-1 text-[10px] opacity-80">Запись поверх создаст двойную нагрузку.</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 text-white text-sm font-black py-3.5 px-4 rounded-xl transition-all shadow-md cursor-pointer ${
                          hasLiveConflict 
                            ? overrideConflict 
                              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                              : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' 
                            : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        {hasLiveConflict 
                          ? overrideConflict 
                            ? 'Записать с наложением' 
                            : 'Подтвердить конфликт' 
                          : 'Записать клиента'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* --- NO-SHOW PREVENTION: MOCK WHATSAPP REMINDER BOTTOM SHEET --- */}
            {isReminderModalOpen && reminderTarget && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex items-end justify-center rounded-3xl overflow-hidden animate-fade-in">
                <div className="absolute inset-0" onClick={() => setIsReminderModalOpen(false)}></div>
                
                <div className="w-full bg-emerald-50 rounded-t-3xl shadow-xl z-50 p-5 border-t-2 border-emerald-500 animate-slide-up max-h-[90%] overflow-y-auto">
                  <div className="w-12 h-1 bg-emerald-200 rounded-full mx-auto mb-4"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <MessageCircle size={18} fill="currentColor" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-850">Напоминание в WhatsApp</h3>
                        <p className="text-xs text-slate-500">Автоматическое подтверждение визита</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsReminderModalOpen(false)}
                      className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center hover:bg-emerald-200 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Simulated Mobile Chat Box */}
                  <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs mb-5 text-left">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        {reminderTarget.clientName.charAt(0)}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">{reminderTarget.clientName}</p>
                        <p className="text-slate-400 text-[10px]">{reminderTarget.phone}</p>
                      </div>
                    </div>

                    <div className="bg-[#DCF8C6] text-slate-800 text-xs p-3 rounded-2xl rounded-tr-none max-w-[90%] ml-auto relative shadow-2xs">
                      <p className="leading-relaxed">
                        Здравствуйте, <strong>{reminderTarget.clientName}</strong>! 🌸 Подтверждаем вашу запись сегодня в <strong>{reminderTarget.time}</strong> на услугу: <em>{reminderTarget.service}</em> к мастеру <strong>{MASTERS.find(m => m.id === reminderTarget.masterId)?.name}</strong>. Пожалуйста, ответьте на это сообщение для подтверждения визита. Спасибо!
                      </p>
                      <span className="text-[9px] text-slate-500 block text-right mt-1 font-medium">15:50 ✓✓</span>
                    </div>
                  </div>

                  <div className="mb-5 flex gap-2 text-emerald-800 bg-emerald-100/50 p-3 rounded-xl text-xs font-semibold text-left">
                    <Sparkles size={16} className="shrink-0 mt-0.5" />
                    <span>В реальной версии это откроет приложение WhatsApp на телефоне Айгерим с уже вставленным текстом. Вы также можете сымитировать это на соседнем экране.</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsReminderModalOpen(false)}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      Закрыть
                    </button>
                    <button
                      onClick={handleSendReminderConfirm}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle size={14} fill="currentColor" />
                      <span>Отправить и подтвердить</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: CLIENT PORTAL (CUSTOMER INTERFACE)         */}
        {/* ======================================================== */}
        <div className={`${mobileView === 'client' ? 'block' : 'hidden md:block'} flex justify-center`}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-250 flex flex-col relative min-h-[820px] max-h-[850px] bg-slate-50/50">
            
            {/* Mock Phone Status Bar */}
            <div className="bg-[#121c27] text-white px-6 py-2.5 flex justify-between items-center text-xs font-semibold select-none">
              <span>15:50</span>
              <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <span className="opacity-80">LTE</span>
                <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                  <div className="w-3.5 h-full bg-white rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* Client App Header */}
            <header className="px-5 pt-5 pb-3 border-b border-slate-100 bg-[#1e2d3d] text-white">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/25 flex items-center justify-center text-amber-400">
                  <Sparkle size={18} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold leading-tight">Салон красоты Bloom</h2>
                  <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Онлайн-запись и личный кабинет</p>
                </div>
              </div>

              {/* Client Tab Selectors */}
              <div className="flex gap-2 mt-4 p-1 bg-slate-900/40 rounded-xl">
                <button
                  onClick={() => setClientTab('book')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    clientTab === 'book'
                      ? 'bg-white text-slate-900 shadow-sm font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  📝 Записаться онлайн
                </button>
                <button
                  onClick={() => setClientTab('my-booking')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative cursor-pointer ${
                    clientTab === 'my-booking'
                      ? 'bg-white text-slate-900 shadow-sm font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🌸 Моя запись
                  {pendingBookingsForClient.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[9px] border border-white animate-bounce">
                      {pendingBookingsForClient.length}
                    </span>
                  )}
                </button>
              </div>
            </header>

            {/* Client Portal Content */}
            <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar pb-20 max-h-[580px] text-left">
              
              {/* TAB 1: ONLINE BOOKING FORM */}
              {clientTab === 'book' && (
                <form onSubmit={handleClientBookOnline} className="space-y-4">
                  {/* Select date selector for client */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Выберите дату</label>
                    <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-3xs">
                      {DATES.map((d) => (
                        <button
                          type="button"
                          key={d.value}
                          onClick={() => {
                            setClientSelectedDate(d.value)
                            setClientTime('09:00') // reset time to avoid conflict confusion
                          }}
                          className={`flex-1 py-2 px-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            clientSelectedDate === d.value 
                              ? 'bg-[#1e2d3d] text-white shadow-sm' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-[7px] leading-none opacity-80">{d.relativeLabel}</span>
                          <span>{d.shortLabel}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Выберите мастера</h3>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {MASTERS.map(m => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => {
                            setClientMasterId(m.id)
                            setClientTime('09:00') // reset time to avoid conflict confusion
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                            clientMasterId === m.id 
                              ? `border-[#1e2d3d] bg-[#1e2d3d] text-white font-bold shadow-md` 
                              : 'border-slate-200 bg-white text-slate-655 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xl mb-1">{m.avatar}</span>
                          <span className="text-[11px] font-black">{m.name}</span>
                          <span className="text-[8px] opacity-75 mt-0.5">{m.role.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Duration Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Длительность</label>
                      <select
                        value={clientDuration}
                        onChange={(e) => {
                          setClientDuration(parseFloat(e.target.value))
                          setClientTime('09:00') // reset to avoid instant conflict
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-500"
                      >
                        <option value={0.5}>30 мин</option>
                        <option value={1.0}>1 час</option>
                        <option value={1.5}>1.5 часа</option>
                        <option value={2.0}>2 часа</option>
                        <option value={3.0}>3 часа</option>
                      </select>
                    </div>

                    {/* Time slots filter (ONLY SHOWS COMPLETELY FREE SLOTS FOR DURATION!) */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Свободное время</label>
                      <select
                        value={clientTime}
                        onChange={(e) => setClientTime(e.target.value)}
                        disabled={clientAvailableSlots.length === 0}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-500 disabled:opacity-50"
                      >
                        {clientAvailableSlots.length > 0 ? (
                          clientAvailableSlots.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))
                        ) : (
                          <option>Нет свободных окон</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Warning inside booking form if master has no slots */}
                  {clientAvailableSlots.length === 0 && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                      <span>У данного специалиста нет окон на эту дату/длительность. Выберите другую дату или мастера.</span>
                    </div>
                  )}

                  {/* Contact info */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ваше имя *</label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Карина Сарсенова"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1e2d3d]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Телефон *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 777 987 6543"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1e2d3d]"
                    />
                  </div>

                  {/* Service Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Услуга</label>
                    <select
                      value={clientService}
                      onChange={(e) => setClientService(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-slate-500 font-medium"
                    >
                      <option value="">Выберите услугу...</option>
                      {SERVICES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={clientAvailableSlots.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm"
                  >
                    <Calendar size={16} />
                    Записаться на сеанс
                  </button>
                </form>
              )}

              {/* TAB 2: MY BOOKINGS (SIMULATION OF VISITS - Confirmed ones persistent) */}
              {clientTab === 'my-booking' && (
                <div className="space-y-4">
                  <div className="bg-[#e9f2fb] p-3.5 rounded-2xl border border-blue-150 text-xs text-slate-700 flex items-start gap-2.5">
                    <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Личный кабинет клиента</strong>
                      <p className="mt-0.5 leading-relaxed text-[11px]">
                        Все ваши записи сохранены здесь. Вы можете подтвердить визиты, ожидающие ответа. Подтвержденные записи не исчезают, а отмечаются зеленым статусом.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Мои записи</h3>
                  
                  {bookings.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                      <CheckCircle size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold font-black">У вас пока нет записей</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">Перейдите на вкладку выше, чтобы записаться.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking) => {
                        const m = MASTERS.find(master => master.id === booking.masterId) || MASTERS[0]
                        const endFloat = timeToFloat(booking.time) + booking.duration
                        const cEnd = floatToTime(endFloat)
                        const bookingDateObj = DATES.find(d => d.value === booking.date)
                        const dateLabel = bookingDateObj ? bookingDateObj.shortLabel : booking.date
                        const isConfirmed = booking.status === 'confirmed'

                        return (
                          <div key={booking.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-3xs flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{m.avatar}</span>
                                <div>
                                  <p className="text-xs font-black text-slate-800">Мастер {m.name}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">{m.role}</p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isConfirmed ? 'Подтвержден' : 'Ждет ответа'}
                              </span>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                              <p><strong>Услуга:</strong> {booking.service}</p>
                              <p><strong>Дата визита:</strong> {dateLabel} ({bookingDateObj ? bookingDateObj.relativeLabel : ''})</p>
                              <p><strong>Время:</strong> {booking.time} - {cEnd} ({booking.duration === 0.5 ? '30 мин' : `${booking.duration} ч`})</p>
                              <p><strong>Имя на записи:</strong> {booking.clientName}</p>
                            </div>

                            {isConfirmed ? (
                              <div className="bg-emerald-50 text-emerald-800 text-xs font-bold py-2.5 px-4 rounded-xl border border-emerald-100 flex items-center justify-center gap-2">
                                <CheckCircle size={16} className="text-emerald-600" />
                                <span>Визит подтвержден! Ждем вас в салоне 🌸</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleClientConfirmVisit(booking.id, booking.clientName)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm shadow-emerald-50 cursor-pointer"
                              >
                                <Check size={14} strokeWidth={2.5} />
                                Да, я подтверждаю свой визит
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* Footer decoration */}
            <div className="bg-slate-100 py-3.5 text-center text-[10px] text-slate-450 border-t border-slate-200">
              Bloom Beauty • Интеграция в 1 клик
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
