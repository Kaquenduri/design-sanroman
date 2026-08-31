'use client';

import { useState } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './SideRail';
import { DispatcherView } from './DispatcherView';
import { DriversView } from './DriversView';
import { UnitsView } from './UnitsView';
import { MembershipsView } from './MembershipsView';
import { ReportsView } from './ReportsView';
import s from './Operadora.module.css';

export type Route =
  | 'despacho'
  | 'conductores'
  | 'unidades'
  | 'membresias'
  | 'reportes';

export function OperadoraApp() {
  const [route, setRoute] = useState<Route>('despacho');

  return (
    <div className={s.app}>
      <TopBar />
      <div className={s.body}>
        <main className={s.main}>
          {route === 'despacho' && <DispatcherView />}
          {route === 'conductores' && <DriversView />}
          {route === 'unidades' && <UnitsView />}
          {route === 'membresias' && <MembershipsView />}
          {route === 'reportes' && <ReportsView />}
        </main>
      </div>
      <BottomNav route={route} onRoute={setRoute} />
    </div>
  );
}
