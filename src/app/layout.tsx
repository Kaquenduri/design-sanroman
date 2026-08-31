import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-jb',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Taxi Real San Román · Sistema de Despacho',
  description:
    'Despacho digital para Taxi Real San Román — Juliaca, Puno. App del conductor, app del cliente y panel de la operadora.',
};

export const viewport: Viewport = {
  themeColor: '#08070C',
  width: 'device-width',
  initialScale: 1,
};

/* Contrato de dirección — sobrevive al build de producción a propósito:
   es el registro auditable de qué se decidió y por qué. */
const DIRECTION_CONTRACT = `<!--
THESIS: Verificar antes de subir. Rechaza el arreglo por defecto del
ride-hailing, donde la confianza la cargan la foto y las estrellas del
conductor; aquí la cargan el sello del gremio y el numeral pintado de la unidad.

OWN-WORLD: Campo morado #8B5CF6 saturado a escala de región sobre negro
violáceo. Sello gremial circular y numeral de unidad como objetos tipográficos
de primera clase; placa vehicular peruana; mapa cartográfico propio como suelo
permanente, con anillos tarifarios concéntricos sobre la Plaza de Armas.

STORY: El pasajero sabe a qué unidad sube y a qué precio antes de solicitar; el
conductor decide en 22 s con tarifa fija; la central solo interviene cuando la
cascada de propuestas se agota.

FIRST VIEWPORT: Mapa a sangre como suelo, hoja inferior con una sola acción
primaria, y el sello del gremio estampándose al quedar asignada la unidad.

FORM: Candidato 5 de la lista ordenada (numeral pintado + sello gremial), seed
5b07bfdb. Mundo fijado por el brief del usuario (oscuro tipo Uber/inDriver con
hoja inferior), elevado con la identidad gremial que el dado aportó.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
-->`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-PE"
      className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
