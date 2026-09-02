'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Map,
  Truck,
  Settings,
  Plus,
} from 'lucide-react';
import styles from './Operadora.module.css';
import { TopBar } from './TopBar';
import { DispatcherMap } from './DispatcherMap';
import { DispatcherView } from './DispatcherView';
import { UnitsModal } from './UnitsModal';
import type { Coordinates } from '@/data';

type NavTab = 'despacho' | 'unidades' | 'config';

const NAV_ITEMS: { id: NavTab; label: string; Icon: typeof Map }[] = [
  { id: 'despacho', label: 'Despacho', Icon: Map },
  { id: 'unidades', label: 'Unidades', Icon: Truck },
  { id: 'config', label: 'Configuración', Icon: Settings },
];

export function OperadoraApp() {
  const [now, setNow] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('despacho');
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  /* Assignment flow state — lifted so map + panel share it */
  const [assigning, setAssigning] = useState(false);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [searchOrigin, setSearchOrigin] = useState<Coordinates | null>(null);
  const [highlightedUnitId, setHighlightedUnitId] = useState<string | null>(null);
  const [selectingLocation, setSelectingLocation] = useState<'origin' | 'destination' | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleNav = useCallback((tab: NavTab) => {
    if (tab === 'unidades') {
      setShowUnitsModal(true);
    } else {
      setActiveTab(tab);
    }
  }, []);

  const handleMapClick = useCallback(
    (coords: Coordinates) => {
      if (!assigning) return;
      if (selectingLocation === 'origin') {
        setOrigin(coords);
        setSelectingLocation(null);
      } else if (selectingLocation === 'destination') {
        setDestination(coords);
        setSelectingLocation(null);
      } else {
        if (!origin) {
          setOrigin(coords);
        } else if (!destination) {
          setDestination(coords);
        }
      }
    },
    [assigning, origin, destination, selectingLocation]
  );

  const openAssign = useCallback(() => {
    setAssigning(true);
    setOrigin(null);
    setDestination(null);
    setHighlightedUnitId(null);
    setSelectingLocation('origin');
  }, []);

  const closeAssign = useCallback(() => {
    setAssigning(false);
    setOrigin(null);
    setDestination(null);
    setSearchRadius(null);
    setSearchOrigin(null);
    setHighlightedUnitId(null);
    setSelectingLocation(null);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.app}>
      <TopBar now={now} theme={theme} onToggleTheme={toggleTheme} />
      <div className={styles.body}>
        {/* Full-screen map */}
        <DispatcherMap
          onMapClick={handleMapClick}
          pinOrigin={origin}
          pinDestination={destination}
          searchRadius={searchRadius}
          searchOrigin={searchOrigin}
          highlightedUnitId={highlightedUnitId}
          selectingLocation={selectingLocation}
        />

        {/* "Asignar carrera" trigger */}
        {!assigning && (
          <div className={styles.assignTriggerBar}>
            <button className={styles.assignTriggerBtn} onClick={openAssign}>
              <Plus size={16} />
              Asignar carrera
            </button>
          </div>
        )}

        {/* Assignment panel — slides from right */}
        {assigning && (
          <DispatcherView
            origin={origin}
            destination={destination}
            onSetOrigin={setOrigin}
            onSetDestination={setDestination}
            onClose={closeAssign}
            onSearchRadiusChange={setSearchRadius}
            onSearchOriginChange={setSearchOrigin}
            onHighlightUnit={setHighlightedUnitId}
            selectingLocation={selectingLocation}
            onSelectLocation={setSelectingLocation}
          />
        )}

        {/* Bottom nav pill */}
        <nav className={styles.bottomNav} aria-label="Navegación principal">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`${styles.bottomNav__item} ${
                activeTab === id && id !== 'unidades'
                  ? styles['bottomNav__item--active']
                  : ''
              }`}
              onClick={() => handleNav(id)}
              aria-label={label}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Units modal — slides from left */}
        {showUnitsModal && (
          <UnitsModal onClose={() => setShowUnitsModal(false)} />
        )}
      </div>
    </div>
  );
}
