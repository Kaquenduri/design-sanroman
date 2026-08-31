import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PhoneFrame } from '@/components/shared/PhoneFrame';
import { ClienteApp } from '@/components/cliente/ClienteApp';
import { Seal } from '@/components/ui';
import s from '../preview.module.css';

export const metadata = { title: 'App del cliente · Real San Román' };

export default function ClientePage() {
  return (
    <main className={s.stage}>
      <div className={s.bar}>
        <Link href="/" className={s.back}>
          <ArrowLeft size={17} />
          Superficies
        </Link>
        <div className={s.titleBlock}>
          <div className={s.title}>App del cliente</div>
          <div className={s.subtitle}>PWA móvil · pasajero en la calle</div>
        </div>
        <Seal size={40} compact className={s.seal} />
      </div>

      <PhoneFrame label="App del cliente">
        <ClienteApp />
      </PhoneFrame>

      <p className={s.hint}>
        Elige un destino y una categoría: el flujo corre solo hasta la
        verificación de la unidad y el cierre del viaje.
      </p>
    </main>
  );
}
