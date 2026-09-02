import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PhoneFrame } from '@/components/shared/PhoneFrame';
import { ConductorApp } from '@/components/conductor/ConductorApp';
import { Seal } from '@/components/ui';
import s from '../preview.module.css';

export const metadata = { title: 'App del conductor · Real San Román' };

export default function ConductorPage() {
  return (
    <main className={s.stage}>
      <div className={s.bar}>
        <Link href="/" className={s.back}>
          <ArrowLeft size={17} />
          Superficies
        </Link>
        <div className={s.titleBlock}>
          <div className={s.title}>App del conductor</div>
          <div className={s.subtitle}>PWA móvil · agremiado en turno</div>
        </div>
        <Seal size={40} compact className={s.seal} />
      </div>

      <PhoneFrame label="App del conductor">
        <ConductorApp />
      </PhoneFrame>

      <p className={s.hint}>
        Abre también la operadora, registra una llamada y observa el despacho
        sincronizado con la Unidad 01.
      </p>
    </main>
  );
}
