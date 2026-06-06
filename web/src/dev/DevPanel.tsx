import { debugData } from '@/nui/debug'
import { Icon } from '@/components/Icon'
import type {
  AlertDialogProps,
  ContextMenuProps,
  InputDialogProps,
  NotificationProps,
  NotificationType,
} from '@/types'

function fireNotify(data: NotificationProps) {
  debugData<NotificationProps>([{ action: 'notify', data }])
}

const CONTEXT_DEMO: ContextMenuProps = {
  title: 'Vehicle Garage',
  canClose: true,
  options: [
    {
      title: 'Karin Sultan RS',
      description: 'Plate · 48ABC123 · Stored',
      icon: 'car',
      arrow: true,
      metadata: [
        { label: 'Fuel', value: '82%', progress: 82 },
        { label: 'Engine', value: '94%', progress: 94 },
        { label: 'Mileage', value: '12,408 km' },
      ],
    },
    { title: 'Customisation', description: 'Open the tuning options', icon: 'wrench', menu: 'tuning_menu' },
    { title: 'Repair in progress', icon: 'screwdriver-wrench', progress: 64, readOnly: true },
    { title: 'Sell Vehicle', description: 'This action cannot be undone', icon: 'dollar-sign', event: 'demo:sell', arrow: true },
    { title: 'Impounded', icon: 'ban', disabled: true },
  ],
}

const DIALOG_DEMO: InputDialogProps = {
  heading: 'Player Registration',
  options: { allowCancel: true, size: 'md' },
  rows: [
    { type: 'input', label: 'Full name', placeholder: 'John Doe', icon: 'user', required: true },
    { type: 'input', label: 'Password', password: true, icon: 'lock' },
    { type: 'number', label: 'Age', default: 21, min: 18, max: 99, icon: 'hashtag' },
    { type: 'slider', label: 'Reputation', default: 50, min: 0, max: 100 },
    {
      type: 'select',
      label: 'Faction',
      icon: 'flag',
      clearable: true,
      searchable: true,
      options: [
        { value: 'lspd', label: 'LSPD' },
        { value: 'bcso', label: 'BCSO' },
        { value: 'sahp', label: 'San Andreas Highway Patrol' },
        { value: 'ems', label: 'EMS' },
        { value: 'doj', label: 'Department of Justice' },
        { value: 'civ', label: 'Civilian' },
      ],
    },
    {
      type: 'multi-select',
      label: 'Licenses',
      maxSelectedValues: 2,
      options: [
        { value: 'car', label: 'Driver' },
        { value: 'bike', label: 'Motorcycle' },
        { value: 'weapon', label: 'Weapon' },
        { value: 'pilot', label: 'Pilot' },
      ],
    },
    { type: 'textarea', label: 'Notes', placeholder: 'Optional background…', autosize: true },
    { type: 'date', label: 'Date of birth', icon: 'calendar', format: 'DD/MM/YYYY', returnString: true },
    { type: 'color', label: 'Plate colour' },
    { type: 'checkbox', label: 'Accept the server rules', checked: false, required: true },
  ],
}

const NOTIFY_DEMOS: { label: string; type: NotificationType; data: NotificationProps }[] = [
  { label: 'Success', type: 'success', data: { type: 'success', title: 'Vehicle stored', description: 'Karin Sultan RS · 48ABC123', showDuration: true, duration: 5000 } },
  { label: 'Error', type: 'error', data: { type: 'error', title: 'Insufficient funds', description: 'You need $4,200 more.' } },
  { label: 'Warning', type: 'warning', data: { type: 'warning', title: 'Restricted area', description: 'Leave before the timer ends.', showDuration: true, duration: 6000 } },
  { label: 'Info · top', type: 'info', data: { type: 'info', title: 'New message', description: 'Dispatch: 911 call in Vinewood.', position: 'top' } },
  { label: 'Info · bottom-left', type: 'info', data: { type: 'info', title: 'Saved', description: 'Your settings were updated.', position: 'bottom-left' } },
]

const DOT: Record<NotificationType, string> = {
  success: 'var(--rs-success)',
  error: 'var(--rs-danger)',
  warning: 'var(--rs-accent)',
  info: 'var(--rs-info)',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="flex items-center gap-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-fg-mute">
        {title}
        <span className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Btn({ onClick, dot, children }: { onClick: () => void; dot?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-[10px] border-[0.5px] border-white/[0.07] bg-surface-02 px-3.5 py-2 text-[13px] font-medium text-fg-soft transition-all duration-150 hover:border-white/[0.14] hover:bg-surface-03 hover:text-fg active:scale-[0.97]"
    >
      {dot && <span className="h-[7px] w-[7px] rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />}
      {children}
    </button>
  )
}

export function DevPanel() {
  return (
    <div className="fixed left-1/2 top-9 z-[200] w-[480px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-2xl border-[0.5px] border-white/10 bg-surface-01 [box-shadow:var(--shadow-float),inset_0_1px_0_rgba(255,255,255,0.05)]">

      <div className="relative flex items-center gap-3.5 border-b-[0.5px] border-sep px-5 py-4 [background:radial-gradient(120%_140%_at_0%_0%,rgba(245,165,36,0.10)_0%,transparent_55%)]">
        <span className="grid h-11 w-11 place-items-center rounded-icon bg-gradient-to-b from-accent-hi to-accent text-[18px] text-[#0b0705] [box-shadow:var(--shadow-inset-tile),0_6px_18px_rgba(245,165,36,0.32)]">
          <Icon icon="bolt" fixedWidth />
        </span>
        <div>
          <h1 className="text-[17px] font-semibold tracking-[var(--tracking-heading)] text-fg">
            ox_lib · Star UI
          </h1>
          <p className="mt-0.5 text-[12px] text-fg-mute">Web preview — not shipped in-game</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <Section title="Notifications">
          {NOTIFY_DEMOS.map((d) => (
            <Btn key={d.label} dot={DOT[d.type]} onClick={() => fireNotify(d.data)}>
              {d.label}
            </Btn>
          ))}
          <Btn
            onClick={() =>
              fireNotify({
                type: 'info',
                icon: 'spinner',
                iconAnimation: 'spin',
                title: 'Processing…',
                description: 'Contacting the server.',
                duration: 8000,
              })
            }
          >
            <Icon icon="spinner" spin fixedWidth /> Animated icon
          </Btn>
          <Btn
            onClick={() => {
              fireNotify({ id: 'job', type: 'info', title: 'Job started', description: 'Heading to the marker…', showDuration: true, duration: 6000 })
              setTimeout(
                () => fireNotify({ id: 'job', type: 'success', title: 'Job complete', description: 'Payout received.', showDuration: true, duration: 4000 }),
                1400,
              )
            }}
          >
            Refresh by id
          </Btn>
          <Btn
            onClick={() =>
              Array.from({ length: 8 }).forEach((_, i) =>
                fireNotify({ type: 'info', title: `Stacked #${i + 1}`, description: 'Oldest is dropped past the cap.' }),
              )
            }
          >
            Flood ×8
          </Btn>
        </Section>

        <Section title="Context menu">
          <Btn onClick={() => debugData([{ action: 'showContext', data: CONTEXT_DEMO }])}>
            <Icon icon="list" fixedWidth /> Open
          </Btn>
          <Btn
            onClick={() =>
              debugData([
                {
                  action: 'showContext',
                  data: {
                    title: 'Quick Actions',
                    options: [
                      { title: 'Give cash', event: 'demo:cash' },
                      { title: 'Send message', event: 'demo:msg' },
                      { title: 'View profile', arrow: true },
                    ],
                  } satisfies ContextMenuProps,
                },
              ])
            }
          >
            No icons
          </Btn>
          <Btn
            onClick={() =>
              debugData([
                { action: 'showContext', data: { title: 'Inventory', options: [] } satisfies ContextMenuProps },
              ])
            }
          >
            Empty
          </Btn>
          <Btn onClick={() => debugData([{ action: 'hideContext', data: {} }])}>Hide</Btn>
        </Section>

        <Section title="Input dialog">
          <Btn onClick={() => debugData([{ action: 'openDialog', data: DIALOG_DEMO }])}>
            <Icon icon="keyboard" fixedWidth /> Open
          </Btn>
          <Btn onClick={() => debugData([{ action: 'closeInputDialog', data: {} }])}>Close</Btn>
        </Section>

        <Section title="Alert dialog">
          <Btn
            onClick={() =>
              debugData<AlertDialogProps>([
                {
                  action: 'sendAlert',
                  data: {
                    header: 'Delete vehicle?',
                    icon: 'trash',
                    content: 'This will **permanently** remove the *Karin Sultan RS* from your garage.\n\nThis action cannot be undone.',
                    cancel: true,
                    labels: { confirm: 'Delete', cancel: 'Keep it' },
                  },
                },
              ])
            }
          >
            <Icon icon="triangle-exclamation" fixedWidth /> Confirm
          </Btn>
          <Btn
            onClick={() =>
              debugData<AlertDialogProps>([
                {
                  action: 'sendAlert',
                  data: {
                    header: 'Server Rules',
                    icon: 'shield-halved',
                    centered: true,
                    size: 'sm',
                    content: 'By playing you agree to:\n\n- No RDM / VDM\n- Stay in character\n- Respect staff',
                  },
                },
              ])
            }
          >
            Centered
          </Btn>
          <Btn onClick={() => debugData([{ action: 'closeAlertDialog', data: {} }])}>Close</Btn>
        </Section>

        <Section title="Progress">
          <Btn onClick={() => debugData([{ action: 'progress', data: { label: 'Lockpicking vehicle', duration: 5000 } }])}>
            <Icon icon="bars-progress" fixedWidth /> Bar
          </Btn>
          <Btn onClick={() => debugData([{ action: 'circleProgress', data: { label: 'Searching', duration: 5000, position: 'middle' } }])}>
            <Icon icon="circle-notch" fixedWidth /> Circle · middle
          </Btn>
          <Btn onClick={() => debugData([{ action: 'circleProgress', data: { label: 'Repairing', duration: 5000, position: 'bottom' } }])}>
            Circle · bottom
          </Btn>
          <Btn onClick={() => debugData([{ action: 'progressCancel', data: {} }])}>Cancel</Btn>
        </Section>

        <Section title="TextUI">
          <Btn
            onClick={() =>
              debugData([{ action: 'textUi', data: { text: '[E] Open trunk', position: 'right-center' } }])
            }
          >
            Key · right
          </Btn>
          <Btn
            onClick={() =>
              debugData([{ action: 'textUi', data: { text: '[Shift] Sprint · hold to **boost**', position: 'bottom-center' } }])
            }
          >
            Wide key · bottom
          </Btn>
          <Btn
            onClick={() =>
              debugData([{ action: 'textUi', data: { text: 'Restricted area ahead', icon: 'triangle-exclamation', iconColor: 'var(--rs-danger)', position: 'top-center' } }])
            }
          >
            Icon · top
          </Btn>
          <Btn onClick={() => debugData([{ action: 'textUiHide', data: {} }])}>Hide</Btn>
        </Section>

        <Section title="Skill check">
          <Btn onClick={() => debugData([{ action: 'startSkillCheck', data: { difficulty: 'easy', inputs: ['e'] } }])}>
            Easy
          </Btn>
          <Btn onClick={() => debugData([{ action: 'startSkillCheck', data: { difficulty: 'hard', inputs: ['e', 'f', 'q'] } }])}>
            Hard
          </Btn>
          <Btn
            onClick={() =>
              debugData([{ action: 'startSkillCheck', data: { difficulty: ['easy', 'medium', 'hard'], inputs: ['e', 'f'] } }])
            }
          >
            3 rounds
          </Btn>
          <Btn onClick={() => debugData([{ action: 'skillCheckCancel', data: {} }])}>Cancel</Btn>
        </Section>

        <Section title="Radial menu">
          <Btn
            onClick={() =>
              debugData([
                {
                  action: 'openRadialMenu',
                  data: {
                    items: [
                      { icon: 'car', label: 'Vehicle' },
                      { icon: 'user', label: 'Player', menu: 'sub' },
                      { icon: 'handcuffs', label: 'Arrest' },
                      { icon: 'wrench', label: 'Repair' },
                      { icon: 'dollar-sign', label: 'Wallet' },
                      { icon: 'map-location-dot', label: 'Waypoint' },
                    ],
                  },
                },
              ])
            }
          >
            <Icon icon="bullseye" fixedWidth /> Open
          </Btn>
          <Btn
            onClick={() =>
              debugData([
                {
                  action: 'openRadialMenu',
                  data: {
                    sub: true,
                    items: [
                      { icon: 'id-card', label: 'Show ID' },
                      { icon: 'comment', label: 'Talk' },
                      { icon: 'hand', label: 'Wave' },
                    ],
                  },
                },
              ])
            }
          >
            Submenu
          </Btn>
          <Btn onClick={() => debugData([{ action: 'openRadialMenu', data: false }])}>Close</Btn>
        </Section>

        <Section title="List menu">
          <Btn
            onClick={() =>
              debugData([
                {
                  action: 'setMenu',
                  data: {
                    title: 'Vehicle Controls',
                    position: 'top-left',
                    items: [
                      { label: 'Engine', icon: 'power-off', checked: true, description: 'Toggle the engine' },
                      { label: 'Doors', icon: 'door-open', values: ['All', 'Front', 'Rear', 'Trunk'], defaultIndex: 1 },
                      { label: 'Fuel', icon: 'gas-pump', progress: 64, colorScheme: 'green' },
                      { label: 'Lock', icon: 'lock', description: 'Lock the vehicle' },
                      { label: 'Livery', icon: 'palette', values: ['Stock', 'Police', 'Racing', 'Custom'] },
                      { label: 'Store vehicle', icon: 'warehouse', close: true },
                    ],
                  },
                },
              ])
            }
          >
            <Icon icon="bars" fixedWidth /> Open
          </Btn>
          <Btn onClick={() => debugData([{ action: 'closeMenu', data: {} }])}>Close</Btn>
        </Section>
      </div>
    </div>
  )
}
