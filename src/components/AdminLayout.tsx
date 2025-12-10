import { AppShell, NavLink, Group, Text } from '@mantine/core'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BudgetWidget from './BudgetWidget'

const navItems = [
  { label: 'Сотрудники', path: '/admin/employees' },
  { label: 'Вопросы', path: '/admin/questions' },
  { label: 'Промпты', path: '/admin/prompts' },
  { label: 'Настройки', path: '/admin/settings' },
  { label: 'Дашборды', path: '/admin/dashboard' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <AppShell navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="md">
        <Group mb="md">
          <Text fw={700} size="lg">OrgMapper</Text>
        </Group>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <BudgetWidget />
        </div>
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
