import AppTabs from '@/components/organisms/app-tabs';

/**
 * Layout del grupo de pestañas. El grupo `(tabs)` no aparece en la URL: las
 * rutas siguen siendo `/`, `/duels`, `/friends` y `/profile`, igual que en
 * `ROUTES`.
 *
 * Existe para que la barra de pestañas envuelva **solo** a sus cuatro
 * pantallas. Las que no son pestaña (ajustes, subida de nivel) cuelgan del
 * `Stack` de `../_layout.tsx` y se abren encima de todo esto.
 */
export default function TabsLayout() {
  return <AppTabs />;
}
