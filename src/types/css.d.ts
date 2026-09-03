/**
 * Metro resuelve las importaciones de CSS al compilar para web, pero
 * TypeScript no las conoce y `tsc --noEmit` falla sobre `import '@/global.css'`
 * y sobre los módulos CSS. Aquí solo se le enseña la forma de esos módulos; no
 * cambia nada en tiempo de ejecución.
 */

/** Módulo CSS: exporta el mapa de nombre local a clase generada. */
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

/** Hoja de estilos global, importada por su efecto secundario. */
declare module '*.css';
