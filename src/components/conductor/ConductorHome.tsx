'use client';

import { useState } from 'react';
import styles from './Conductor.module.css';
import { HomeOffline } from './HomeOffline';
import { HomeOnline } from './HomeOnline';
import { IncomingRequest } from './IncomingRequest';
import { HeadingToPassenger } from './HeadingToPassenger';
import { InTrip } from './InTrip';
import { TripFinished } from './TripFinished';
import { DailySummary } from './DailySummary';
import { Profile } from './Profile';

export type ConductorScreen =
  | 'home-offline'
  | 'home-online'
  | 'incoming'
  | 'heading'
  | 'in-trip'
  | 'finished'
  | 'summary'
  | 'profile';

export type DriverStatus = 'online' | 'offline' | 'break';

export function ConductorHome() {
  const [screen, setScreen] = useState<ConductorScreen>('home-offline');
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('offline');

  const goOnline = () => {
    setDriverStatus('online');
    setScreen('home-online');
  };

  const goOffline = () => {
    setDriverStatus('offline');
    setScreen('home-offline');
  };

  const goBreak = () => {
    setDriverStatus('break');
    setScreen('home-online');
  };

  const receiveRequest = () => {
    if (driverStatus === 'online') {
      setScreen('incoming');
    }
  };

  const acceptRequest = () => setScreen('heading');

  const arrivedAtPassenger = () => setScreen('in-trip');

  const finishTrip = () => setScreen('finished');

  const backToOnline = () => {
    setDriverStatus('online');
    setScreen('home-online');
  };

  return (
    <div className={styles.app} data-screen={screen}>
      {driverStatus === 'break' && screen === 'home-online' && (
        <div className={styles.breakOverlay}>
          <div className={styles.breakOverlayIcon}>☕</div>
          <div className={styles.breakOverlayText}>En hora de descanso</div>
        </div>
      )}
      {screen === 'home-offline' && (
        <HomeOffline
          onGoOnline={goOnline}
          onGoBreak={goBreak}
          driverStatus={driverStatus}
          onProfile={() => setScreen('profile')}
          onSummary={() => setScreen('summary')}
        />
      )}
      {screen === 'home-online' && (
        <HomeOnline
          onGoOffline={goOffline}
          onGoBreak={goBreak}
          driverStatus={driverStatus}
          onProfile={() => setScreen('profile')}
          onSummary={() => setScreen('summary')}
          onSimulate={receiveRequest}
        />
      )}
      {screen === 'incoming' && (
        <IncomingRequest onAccept={acceptRequest} onReject={backToOnline} />
      )}
      {screen === 'heading' && (
        <HeadingToPassenger onArrived={arrivedAtPassenger} onCancel={backToOnline} />
      )}
      {screen === 'in-trip' && (
        <InTrip onFinish={finishTrip} />
      )}
      {screen === 'finished' && (
        <TripFinished onNext={backToOnline} onClose={goOffline} />
      )}
      {screen === 'summary' && (
        <DailySummary onBack={() => setScreen(driverStatus === 'online' ? 'home-online' : 'home-offline')} />
      )}
      {screen === 'profile' && (
        <Profile onBack={() => setScreen(driverStatus === 'online' ? 'home-online' : 'home-offline')} />
      )}
    </div>
  );
}
