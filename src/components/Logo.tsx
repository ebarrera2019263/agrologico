/* Marca: una gota que también es planta — el agua y el cultivo en un
   solo trazo, que es exactamente lo que vende la empresa.
   La planta va calada (fill-rule evenodd) para que el fondo se vea a
   través de ella y la marca funcione en claro y en oscuro por igual. */
export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 28 32" className="h-full w-auto" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="currentColor"
          d="M14 2C14 2 3 13 3 20.2 3 26.2 7.9 31 14 31s11-4.8 11-10.8C25 13 14 2 14 2Z
             M13.4 12.6h1.2v13.2h-1.2z
             M13.4 19.5c-3.4 0-5.5-2.1-5.5-5.6 3.4 0 5.5 2.1 5.5 5.6Z
             M14.6 17c0-3.5 2.1-5.6 5.5-5.6 0 3.5-2.1 5.6-5.5 5.6Z"
        />
      </svg>
      <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em] leading-none">
        Agrológico
      </span>
    </span>
  );
}
