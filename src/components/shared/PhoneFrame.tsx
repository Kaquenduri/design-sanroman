import type { ReactNode } from 'react';
import styles from './PhoneFrame.module.css';

type Props = {
  children: ReactNode;
  title?: string;
};

export function PhoneFrame({ children, title }: Props) {
  const now = new Date().toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className={styles.stage}>
      <div className={styles.phone} role="figure" aria-label={title ?? 'Phone preview'}>
        <div className={styles.notch} aria-hidden />
        <div className={styles.bezelTop}>
          <span className={styles.time}>{now}</span>
          <span className={styles.indicators} aria-hidden>
            <span className={styles.signal} />
            <span className={styles.wifi} />
            <span className={styles.battery} />
          </span>
        </div>
        <div className={styles.screen}>
          <div className={styles.appContent}>{children}</div>
        </div>
        <div className={styles.homeIndicator} aria-hidden />
      </div>
    </div>
  );
}
