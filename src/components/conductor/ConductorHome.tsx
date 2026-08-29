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

export function ConductorHome() {
  const [screen, setScreen] = useState<ConductorScreen>('home-offline');
  const [online, setOnline] = useState(false);

  const goOnline = () => {
    setOnline(true);
    setScreen('home-online');
  };

  const goOffline = () => {
    setOnline(false);
    setScreen('home-offline');
  };

  const receiveRequest = () => setScreen('incoming');

  const acceptRequest = () => setScreen('heading');

  const arrivedAtPassenger = () => setScreen('in-trip');

  const finishTrip = () => setScreen('finished');

  const backToOnline = () => setScreen('home-online');

  return (
    <div className={styles.app} data-screen={screen}>
      {screen === 'home-offline' && (
        <HomeOffline onGoOnline={goOnline} onProfile={() => setScreen('profile')} onSummary={() => setScreen('summary')} />
      )}
      {screen === 'home-online' && (
        <HomeOnline onGoOffline={goOffline} onProfile={() => setScreen('profile')} onSummary={() => setScreen('summary')} onSimulate={receiveRequest} />
      )}
      {screen === 'incoming' && (
        <IncomingRequest onAccept={acceptRequest} onReject={goOnline} />
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
        <DailySummary onBack={() => setScreen(online ? 'home-online' : 'home-offline')} />
      )}
      {screen === 'profile' && (
        <Profile onBack={() => setScreen(online ? 'home-online' : 'home-offline')} />
      )}
    </div>
  );
}
