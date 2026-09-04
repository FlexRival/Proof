import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ROUTES } from '@/constants/routes';
import { Colors } from '@/constants/theme';

/**
 * `NativeTabs` no admite generar triggers dinámicamente (no acepta un
 * `.map()`) — cada uno se escribe a mano. `name` es el nombre de archivo de
 * la ruta dentro de `src/app/` (`index` para `/`), no el `href` del
 * contrato; el texto sí sale de `ROUTES` para no duplicarlo.
 *
 * Íconos del sistema (SF Symbols en iOS, Material Symbols en Android) en vez
 * de imágenes propias: no hay assets de marca todavía para duelos/amigos/
 * perfil. Cámbialos cuando haya íconos propios — un `sf`/`md` por trigger.
 */
export default function AppTabs() {
  const colors = Colors.dark;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{ROUTES.home.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="duels">
        <NativeTabs.Trigger.Label>{ROUTES.duels.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bolt.fill" md="bolt" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="friends">
        <NativeTabs.Trigger.Label>{ROUTES.friends.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="group" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>{ROUTES.profile.label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
