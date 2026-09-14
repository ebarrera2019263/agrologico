import logoColor from "../assets/logo.svg";
import logoClaro from "../assets/logo-blanco.svg";

/* Logo oficial de Agrologico, vectorizado desde el original
   (LOGO AGROLOGICO 2025 AF.pdf). Dos versiones:
   - "claro": el logotipo va en blanco hueso, para fondos oscuros.
   - "color": versión a color completa, para fondos claros.
   La marca («a» con las dos hojas) conserva sus colores en ambas.

   Se importan como módulo para que Vite les resuelva la ruta con el
   prefijo correcto al publicar en un subdirectorio. */

export function Logo({
  className = "h-10",
  variante = "claro",
}: {
  className?: string;
  variante?: "claro" | "color";
}) {
  return (
    <img
      src={variante === "claro" ? logoClaro : logoColor}
      alt="Agrologico, soluciones y tecnologías"
      width={625}
      height={165}
      className={`${className} w-auto`}
    />
  );
}
