'use client';
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, parseISO, isValid } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import './DatePickerInput.css';

interface Props {
  label: React.ReactNode;
  value: string;         // YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string;          // YYYY-MM-DD
  defaultMonth?: string; // YYYY-MM-DD — month to show when calendar first opens
  placement?: 'right' | 'above';
}

const DISPLAY = 'MM/dd/yyyy';

function toDisplay(iso: string) {
  if (!iso) return '';
  try {
    const [y, m, d] = iso.split('-').map(Number);
    return format(new Date(y, m - 1, d), DISPLAY);
  } catch { return ''; }
}

function toISO(display: string) {
  if (display.length !== 10) return null;
  const d = parse(display, DISPLAY, new Date());
  return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
}

// ── Custom year dropdown: floating scrollable list (8 items visible) ─────────

type DropdownOption = { value: number; label: string; disabled: boolean };

type DropdownProps = {
  options?: DropdownOption[];
  value?: React.SelectHTMLAttributes<HTMLSelectElement>['value'];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string;
  [key: string]: unknown;
};

function YearPicker({ options = [], value, onChange }: Pick<DropdownProps, 'options' | 'value' | 'onChange'>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const sel = listRef.current.querySelector<HTMLElement>('.tt-yr-item-active');
    sel?.scrollIntoView({ block: 'center' });
  }, [open]);

  const selectedLabel = options.find(o => String(o.value) === String(value))?.label ?? String(value);

  return (
    <div ref={rootRef} className="tt-yr-root">
      <button type="button" className="tt-yr-btn" onClick={() => setOpen(v => !v)}>
        {selectedLabel}
        <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div ref={listRef} className="tt-yr-list">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              className={`tt-yr-item${String(opt.value) === String(value) ? ' tt-yr-item-active' : ''}`}
              onClick={() => {
                onChange?.({ target: { value: String(opt.value) } } as React.ChangeEvent<HTMLSelectElement>);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomDropdown({ options = [], value, onChange }: DropdownProps) {
  return <YearPicker options={options} value={value} onChange={onChange} />;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DatePickerInput({ label, value, onChange, min, defaultMonth, placement = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => toDisplay(value));
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);

  function isoToLocal(s: string) { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); }
  const selected         = value        ? isoToLocal(value)        : undefined;
  const minDate          = min          ? isoToLocal(min)          : undefined;
  const defaultMonthDate = defaultMonth ? isoToLocal(defaultMonth) : undefined;

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
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const popupW = 292; // 260px calendar + 2×16px padding

      let style: React.CSSProperties;

      if (vw < 768) {
        // Mobile: position below (or above if no room), clamped to viewport
        const spaceBelow = vh - rect.bottom - 8;
        const spaceAbove = rect.top - 8;
        let left = Math.max(8, Math.min(rect.left, vw - popupW - 8));

        const maxH = Math.max(spaceBelow, spaceAbove) - 8;
        if (spaceBelow >= spaceAbove) {
          style = { position: 'fixed', top: rect.bottom + 8, left, zIndex: 10200, maxHeight: maxH, overflowY: 'auto' };
        } else {
          style = { position: 'fixed', bottom: vh - rect.top + 8, left, zIndex: 10200, maxHeight: maxH, overflowY: 'auto' };
        }
      } else {
        // Desktop: original logic
        style = placement === 'above'
          ? { position: 'fixed', bottom: vh - rect.top + 8, left: rect.left, zIndex: 10200 }
          : { position: 'fixed', top: rect.top, left: rect.right + 8, zIndex: 10200 };
      }

      setPopupStyle(style);
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
            startMonth={new Date(2005, 0)}
            endMonth={new Date(2035, 11)}
            className="tt-cal"
            components={{ Dropdown: CustomDropdown as never }}
          />
        </div>
      )}
    </div>
  );
}
