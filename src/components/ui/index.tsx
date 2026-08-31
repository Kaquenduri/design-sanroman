'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Star } from 'lucide-react';
import s from './ui.module.css';

/* ==========================================================================
   Kit de componentes — Taxi Real San Román
   ========================================================================== */

const cx = (...v: (string | false | undefined | null)[]) =>
  v.filter(Boolean).join(' ');

/* ------------------------------------------------------ Sello gremial --- */

type SealProps = {
  size?: number;
  /** Bajo ~44px el sello con texto es ilegible: se cae al distintivo corto. */
  compact?: boolean;
  className?: string;
  title?: string;
};

/**
 * El sello del gremio. Es la marca de confianza del producto: lo que un
 * pasajero busca antes de subir, y lo que separa a una unidad agremiada de
 * cualquier auto que pare en la calle.
 */
export function Seal({
  size = 64,
  compact = false,
  className,
  title = 'Taxi Real San Román · gremial 32-2020',
}: SealProps) {
  const short = compact || size < 44;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <circle
        cx="100"
        cy="100"
        r="86"
        stroke="currentColor"
        strokeWidth="10"
      />
      {!short && (
        <g
          fill="currentColor"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontWeight="800"
        >
          <text x="100" y="58" fontSize="25" letterSpacing="9">
            REAL
          </text>
          <text x="100" y="90" fontSize="26" letterSpacing="-0.5">
            SAN ROMÁN
          </text>
          <text x="100" y="124" fontSize="26" letterSpacing="-0.5">
            32 2020
          </text>
        </g>
      )}

      {/* Damero de taxi. En el distintivo corto crece para seguir leyéndose
          a 24-30 px, donde el sello completo sería una mancha. */}
      <g fill="currentColor">
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1].map((row) =>
            (col + row) % 2 === 0 ? (
              <rect
                key={`${col}-${row}`}
                x={(short ? 65 : 77.5) + col * (short ? 14 : 9)}
                y={(short ? 66 : 134) + row * (short ? 14 : 9)}
                width={short ? 14 : 9}
                height={short ? 14 : 9}
              />
            ) : null
          )
        )}
      </g>

      {/* Sonrisa */}
      <path
        d={short ? 'M 56 118 Q 100 160 144 118' : 'M 68 158 Q 100 180 132 158'}
        stroke="currentColor"
        strokeWidth={short ? 14 : 9}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ------------------------------------------------------------- Botón --- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | 'primary'
    | 'neutral'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'danger'
    | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  full?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(s.btn, s[size], s[variant], className)}
      data-full={full ? 'true' : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconButton({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...rest
}: Omit<ButtonProps, 'full'>) {
  const dim = size === 'sm' ? s.iconSm : size === 'lg' ? s.iconLg : s.iconMd;
  return (
    <button
      className={cx(s.iconBtn, dim, s[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------- Etiqueta --- */

type Tone =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'solid';

const TONE: Record<Tone, string> = {
  brand: s.tBrand,
  success: s.tSuccess,
  warning: s.tWarning,
  danger: s.tDanger,
  info: s.tInfo,
  neutral: s.tNeutral,
  solid: s.tSolid,
};

export function Chip({
  tone = 'neutral',
  dot,
  live,
  large,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  live?: boolean;
  large?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(s.chip, large && s.chipLg, TONE[tone], className)}
    >
      {dot && <span className={cx(s.dot, live && s.dotLive)} />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ Avatar --- */

export function Avatar({
  initials,
  size = 40,
  ring,
  online,
  className,
}: {
  initials: string;
  size?: number;
  ring?: boolean;
  online?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        s.avatar,
        ring && s.avatarRing,
        online && s.avatarStatus,
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------- Placa --- */

export function Plate({
  value,
  large,
  className,
}: {
  value: string;
  large?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(s.plate, large && s.plateLg, className)}
      aria-label={`Placa ${value}`}
    >
      {value}
    </span>
  );
}

/* -------------------------------------------------- Numeral de unidad --- */

export function UnitBadge({
  n,
  size = 'md',
  label,
  className,
}: {
  n: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}) {
  const dim = size === 'sm' ? s.unitSm : size === 'lg' ? s.unitLg : s.unitMd;
  return (
    <span className={cx(s.unit, dim, className)}>
      <span className={s.unitPlate} aria-label={`Unidad ${n}`}>
        {n}
      </span>
      {label && (
        <span className={s.unitLabel}>
          <span className={s.unitWord}>Unidad</span>
          <span className={s.unitName}>{label}</span>
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------- Card --- */

export function Card({
  brand,
  pad = true,
  className,
  children,
  ...rest
}: {
  brand?: boolean;
  pad?: boolean;
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(s.card, pad && s.cardPad, brand && s.cardBrand, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- Sheet --- */

export function Sheet({
  grabber = true,
  className,
  children,
}: {
  grabber?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx(s.sheet, className)}>
      {grabber && <div className={s.grabber} aria-hidden />}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- Stat --- */

export function Stat({
  label,
  value,
  sub,
  size = 'md',
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dim = size === 'sm' ? s.statSm : size === 'lg' ? s.statLg : s.statMd;
  return (
    <div className={cx(s.stat, dim, className)}>
      <span className={s.statLabel}>{label}</span>
      <span className={s.statValue}>{value}</span>
      {sub && <span className={s.statSub}>{sub}</span>}
    </div>
  );
}

/* -------------------------------------------------------- Segmentado --- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cx(s.segmented, className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          className={cx(s.segItem, o.value === value && s.segActive)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={s.segCount}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- Campo --- */

export function Field({
  icon,
  value,
  placeholder,
  onChange,
  small,
  className,
}: {
  icon?: ReactNode;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  small?: boolean;
  className?: string;
}) {
  return (
    <div className={cx(s.field, small && s.fieldSm, className)}>
      {icon}
      <input
        className={s.fieldInput}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Campo que en realidad abre otra pantalla — no acepta escritura in situ. */
export function FieldButton({
  icon,
  text,
  empty,
  trailing,
  onClick,
  className,
}: {
  icon?: ReactNode;
  text: string;
  empty?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button className={cx(s.field, className)} onClick={onClick} type="button">
      {icon}
      <span className={cx(s.fieldText, empty && s.fieldEmpty)}>{text}</span>
      {trailing}
    </button>
  );
}

/* ------------------------------------------------- Anillo de cuenta atrás --- */

export function CountdownRing({
  value,
  total,
  size = 56,
  urgent,
}: {
  value: number;
  total: number;
  size?: number;
  urgent?: boolean;
}) {
  const stroke = size >= 56 ? 5 : 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / total));
  return (
    <div className={s.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={s.ringSvg}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={s.ringTrack}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={cx(s.ringBar, urgent && s.ringUrgent)}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <span
        className={s.ringValue}
        style={{ fontSize: size * 0.32 }}
      >
        {value}
      </span>
    </div>
  );
}

/* --------------------------------------------------------- Estrellas --- */

export function Stars({
  value,
  count,
  size = 13,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  return (
    <span className={s.stars}>
      <Star
        size={size}
        className={s.starIcon}
        fill="currentColor"
        strokeWidth={0}
      />
      <span>{value.toFixed(1)}</span>
      {count !== undefined && <span>· {count} viajes</span>}
    </span>
  );
}

/* ------------------------------------------------- Origen → destino --- */

export function Legs({
  from,
  fromMeta,
  to,
  toMeta,
  className,
}: {
  from: string;
  fromMeta?: string;
  to: string;
  toMeta?: string;
  className?: string;
}) {
  return (
    <div className={cx(s.legs, className)}>
      <div className={s.legRail} aria-hidden>
        <span className={s.legDotA} />
        <span className={s.legLine} />
        <span className={s.legDotB} />
      </div>
      <div className={s.legItems}>
        <div className={s.legItem}>
          <div className={s.legLabel}>Recoger en</div>
          <div className={s.legValue}>{from}</div>
          {fromMeta && <div className={s.legMeta}>{fromMeta}</div>}
        </div>
        <div className={s.legItem}>
          <div className={s.legLabel}>Destino</div>
          <div className={s.legValue}>{to}</div>
          {toMeta && <div className={s.legMeta}>{toMeta}</div>}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Auxiliares --- */

export function Divider({ className }: { className?: string }) {
  return <hr className={cx(s.divider, className)} />;
}

export function Empty({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.empty}>
      <div className={s.emptyIcon}>{icon}</div>
      <div className={s.emptyTitle}>{title}</div>
      {children && <p className={s.emptyBody}>{children}</p>}
    </div>
  );
}

/** Marca explícita de dato inventado. El producto exige no disfrazar mocks. */
export function Synthetic({ children }: { children: ReactNode }) {
  return (
    <span className={s.synthetic}>
      <Seal size={13} compact />
      {children}
    </span>
  );
}
