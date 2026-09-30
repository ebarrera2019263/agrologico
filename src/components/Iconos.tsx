/* Íconos dibujados como esquemas de campo: trazo delgado y uniforme,
   sin relleno, con la lógica de un plano de riego. */

type Props = { className?: string };

const base = "none";
const trazo = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: base,
};

export function IconoRiego({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M3 9h26" {...trazo} />
      <path d="M9 9v4M16 9v4M23 9v4" {...trazo} />
      <path d="M9 17c0 1.4-1 2.2-1 3.4a1 1 0 0 0 2 0c0-1.2-1-2-1-3.4Z" {...trazo} />
      <path d="M16 17c0 1.4-1 2.2-1 3.4a1 1 0 0 0 2 0c0-1.2-1-2-1-3.4Z" {...trazo} />
      <path d="M23 17c0 1.4-1 2.2-1 3.4a1 1 0 0 0 2 0c0-1.2-1-2-1-3.4Z" {...trazo} />
      <path d="M4 27h24" {...trazo} />
    </svg>
  );
}

export function IconoProtegida({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 27V15a12 9 0 0 1 24 0v12" {...trazo} />
      <path d="M16 6v21" {...trazo} />
      <path d="M4 17h24" {...trazo} />
      <path d="M10 27v-3.5M22 27v-3.5" {...trazo} />
      <path d="M10 23.5c-1.8 0-2.8-1-2.8-2.8 1.8 0 2.8 1 2.8 2.8Z" {...trazo} />
      <path d="M22 23.5c1.8 0 2.8-1 2.8-2.8-1.8 0-2.8 1-2.8 2.8Z" {...trazo} />
      <path d="M2 27h28" {...trazo} />
    </svg>
  );
}

export function IconoNutricion({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 28V13" {...trazo} />
      <path d="M16 17c-4 0-6.5-2.4-6.5-6.5C13.5 10.5 16 12.9 16 17Z" {...trazo} />
      <path d="M16 14c0-4.1 2.5-6.5 6.5-6.5C22.5 11.6 20 14 16 14Z" {...trazo} />
      <path d="M5 22h22" {...trazo} />
      <path d="M7 26h18" {...trazo} />
    </svg>
  );
}

export function IconoSemilla({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <ellipse cx="16" cy="12" rx="6" ry="8" {...trazo} />
      <path d="M16 6v12" {...trazo} />
      <path d="M16 20v8" {...trazo} />
      <path d="M12 25h8" {...trazo} />
      <path d="M4 28h24" {...trazo} />
    </svg>
  );
}

export function IconoProteccion({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 4l10 3.5v8c0 6-4.2 10-10 12.5C9.8 25.5 6 21.5 6 15.5v-8L16 4Z" {...trazo} />
      <path d="M16 12v8" {...trazo} />
      <path d="M16 15c-2.2 0-3.6-1.3-3.6-3.6C14.6 11.4 16 12.8 16 15Z" {...trazo} />
      <path d="M16 14c0-2.2 1.4-3.6 3.6-3.6C19.6 12.6 18.2 14 16 14Z" {...trazo} />
    </svg>
  );
}

export function IconoEquipo({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="9" y="6" width="10" height="13" rx="2" {...trazo} />
      <path d="M19 10h4a2 2 0 0 1 2 2v3" {...trazo} />
      <path d="M25 15c0 1.6-1.1 2.5-1.1 3.8a1.1 1.1 0 0 0 2.2 0c0-1.3-1.1-2.2-1.1-3.8Z" {...trazo} />
      <path d="M12 19v7" {...trazo} />
      <path d="M16 19v7" {...trazo} />
      <path d="M8 26h12" {...trazo} />
    </svg>
  );
}

export function IconoAsesoria({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M5 7h22v14H16l-6 5v-5H5V7Z" {...trazo} />
      <path d="M16 17v-5" {...trazo} />
      <path d="M16 14c-2.4 0-4-1.5-4-4 2.4 0 4 1.5 4 4Z" {...trazo} />
      <path d="M16 13c0-2.5 1.6-4 4-4 0 2.5-1.6 4-4 4Z" {...trazo} />
    </svg>
  );
}

export function IconoWhatsApp({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.85.84-.85 2.04s.87 2.37.99 2.53c.12.17 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}

export const iconos = {
  riego: IconoRiego,
  protegida: IconoProtegida,
  nutricion: IconoNutricion,
  semilla: IconoSemilla,
  proteccion: IconoProteccion,
  equipo: IconoEquipo,
  asesoria: IconoAsesoria,
};
