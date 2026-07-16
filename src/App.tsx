import { useProfile } from '@/store/profile';
import { useNav } from '@/store/navigation';
import { HomeScreen } from '@/screens/HomeScreen';
import { TrainingScreen } from '@/screens/TrainingScreen';
import { BossRushScreen } from '@/screens/BossRushScreen';
import { BadgesScreen } from '@/screens/BadgesScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { BottomNav } from '@/components/BottomNav';

export default function App() {
  const { route } = useNav();
  const { profile } = useProfile();

  // Les modes de jeu occupent tout l'écran (pas de barre de navigation).
  const isFullscreen = route.name === 'training' || route.name === 'boss';

  return (
    <div className={`min-h-full ${profile.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      {route.name === 'home' && <HomeScreen />}
      {route.name === 'training' && <TrainingScreen source={route.source} />}
      {route.name === 'boss' && <BossRushScreen />}
      {route.name === 'badges' && <BadgesScreen />}
      {route.name === 'settings' && <SettingsScreen />}
      {!isFullscreen && <BottomNav />}
    </div>
  );
}
