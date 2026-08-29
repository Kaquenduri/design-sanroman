'use client';

import { useEffect, useState } from 'react';
import styles from './Operadora.module.css';
import { TopBar } from './TopBar';
import { SideRail } from './SideRail';
import { DispatcherView } from './DispatcherView';
import { DriversView } from './DriversView';
import { UnitsView } from './UnitsView';
import { MembershipsView } from './MembershipsView';
import { ReportsView } from './ReportsView';

export type OperadoraRoute =
  | 'despacho'
  | 'conductores'
  | 'unidades'
  | 'membresias'
  | 'reportes';

export function OperadoraApp() {
  const [route, setRoute] = useState<OperadoraRoute>('despacho');
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.app}>
      <TopBar now={now} />
      <div className={styles.body}>
        <SideRail route={route} onRoute={setRoute} />
        <main className={styles.main}>
          {route === 'despacho' && <DispatcherView />}
          {route === 'conductores' && <DriversView />}
          {route === 'unidades' && <UnitsView />}
          {route === 'membresias' && <MembershipsView />}
          {route === 'reportes' && <ReportsView />}
        </main>
      </div>
    </div>
  );
}
