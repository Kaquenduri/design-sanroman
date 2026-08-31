import type { ReactNode } from 'react';
import s from './PhoneFrame.module.css';

/**
 * Marco de dispositivo para la vista previa en escritorio.
 *
 * La hora es fija (9:41) a propósito: `new Date()` en render desincroniza
 * servidor y cliente, y en una maqueta el reloj no aporta nada.
 */
export function PhoneFrame({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className={s.phone} role="figure" aria-label={label}>
      <div className={s.screen}>
        <div className={s.island} aria-hidden />
        <div className={s.statusBar} aria-hidden>
          <span>9:41</span>
          <span className={s.indicators}>
            <span className={s.signal} />
            <span className={s.wifi} />
            <span className={s.battery} />
          </span>
        </div>
        <div className={s.content}>{children}</div>
        <div className={s.homeBar} aria-hidden />
      </div>
    </div>
  );
}
