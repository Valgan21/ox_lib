import { Notifications } from './components/Notifications/Notifications'
import { ContextMenu } from './components/ContextMenu/ContextMenu'
import { InputDialog } from './components/InputDialog/InputDialog'
import { AlertDialog } from './components/AlertDialog/AlertDialog'
import { Progress } from './components/Progress/Progress'
import { TextUI } from './components/TextUI/TextUI'
import { SkillCheck } from './components/SkillCheck/SkillCheck'
import { RadialMenu } from './components/RadialMenu/RadialMenu'
import { MotionConfig } from 'framer-motion'
import { MenuList } from './components/MenuList/MenuList'
import { SystemBridge } from './components/SystemBridge'
import { DevPanel } from './dev/DevPanel'

// import.meta.env.DEV is a compile-time constant: true under `npm run dev`,
// false in the production build. Gating the preview-only chrome with it strips
// the dark backdrop + DevPanel from the shipped bundle entirely, so no opaque
// element can ever cover the game — independent of any runtime detection.
const DEV = import.meta.env.DEV

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SystemBridge />

      <Notifications />
      <ContextMenu />
      <InputDialog />
      <AlertDialog />
      <Progress />
      <TextUI />
      <SkillCheck />
      <RadialMenu />
      <MenuList />

      {DEV && (
        <div
          className="fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(60% 80% at 50% 0%, rgba(245,165,36,0.05) 0%, transparent 60%), #0b0b0c',
          }}
        />
      )}
      {DEV && <DevPanel />}
    </MotionConfig>
  )
}
