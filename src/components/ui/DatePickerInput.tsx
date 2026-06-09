'use client';
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, parseISO, isValid } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import './DatePickerInput.css';

interface Props {
  label: string;
  value: string;         // YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string;          // YYYY-MM-DD
  defaultMonth?: string; // YYYY-MM-DD — month to show when calendar first opens
  placement?: 'right' | 'above';
}

const DISPLAY = 'MM/dd/yyyy';

function toDisplay(iso: string) {
  if (!iso) return '';
  try { return format(parseISO(iso), DISPLAY); } catch { return ''; }
}

function toISO(display: string) {
  if (display.length !== 10) return null;
  const d = parse(display, DISPLAY, new Date());
  return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
}

export default function DatePickerInput({ label, value, onChange, min, defaultMonth, placement = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => toDisplay(value));
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);

  const selected         = value        ? (() => { try { return parseISO(value);        } catch { return undefined; } })() : undefined;
  const minDate          = min          ? (() => { try { return parseISO(min);          } catch { return undefined; } })() : undefined;
  const defaultMonthDate = defaultMonth ? (() => { try { return parseISO(defaultMonth); } catch { return undefined; } })() : undefined;

  useEffect(() => { setText(toDisplay(value)); }, [value]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handleToggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopupStyle(placement === 'above'
        ? { position: 'fixed', bottom: window.innerHeight - rect.top + 8, left: rect.left, zIndex: 10200 }
        : { position: 'fixed', top: rect.top, left: rect.right + 8, zIndex: 10200 }
      );
    }
    setOpen(v => !v);
  }

  function handleType(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setText(formatted);
    const iso = toISO(formatted);
    if (iso) onChange(iso);
    else if (formatted === '') onChange('');
  }

  function handleBlur() {
    if (text && !toISO(text)) setText(toDisplay(value));
  }

  function handleCalendarSelect(date: Date | undefined) {
    if (!date) return;
    onChange(format(date, 'yyyy-MM-dd'));
    setText(format(date, DISPLAY));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
        {label}
      </label>

      <div className={`flex items-center border rounded-xl px-4 py-3 transition-colors ${
        open ? 'border-[#C87A53]' : 'border-[#E8E6E1] hover:border-[#C0BAB2]'
      }`}>
        <input
          type="text"
          placeholder="MM/DD/YYYY"
          value={text}
          onChange={handleType}
          onBlur={handleBlur}
          className="flex-1 text-sm bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-[#C0BAB2] min-w-0"
        />
        <button
          type="button"
          onClick={handleToggle}
          className="flex-shrink-0 ml-2 text-[#8A8A8A] hover:text-[#C87A53] transition-colors"
        >
          <CalendarDays size={18} />
        </button>
      </div>

      {open && (
        <div style={popupStyle} className="bg-white rounded-2xl shadow-xl border border-[#E8E6E1] p-4">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleCalendarSelect}
            disabled={minDate ? { before: minDate } : undefined}
            defaultMonth={defaultMonthDate ?? selected}
            captionLayout="dropdown"
            startMonth={new Date(2000, 0)}
            endMonth={new Date(2035, 11)}
            className="tt-cal"
          />
        </div>
      )}
    </div>
  );
}
