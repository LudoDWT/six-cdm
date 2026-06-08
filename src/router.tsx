import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/routes/login'
import { DashboardPage } from '@/routes/index'
import { MatchsPage } from '@/routes/matchs'
import { MatchDetailPage } from '@/routes/match.$id'
import { ClassementPage } from '@/routes/classement'
import { BonusPage } from '@/routes/bonus'
import { CagnottePage } from '@/routes/cagnotte'
import { ReglesPage } from '@/routes/regles'
import { ProfilPage } from '@/routes/profil'

const rootRoute = createRootRoute({ component: () => <Outlet /> })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage })
const appRoute = createRoute({ getParentRoute: () => rootRoute, id: 'app', component: AppLayout })
const indexRoute = createRoute({ getParentRoute: () => appRoute, path: '/', component: DashboardPage })
const matchsRoute = createRoute({ getParentRoute: () => appRoute, path: '/matchs', component: MatchsPage })
const matchDetailRoute = createRoute({ getParentRoute: () => appRoute, path: '/match/$id', component: MatchDetailPage })
const classementRoute = createRoute({ getParentRoute: () => appRoute, path: '/classement', component: ClassementPage })
const bonusRoute = createRoute({ getParentRoute: () => appRoute, path: '/bonus', component: BonusPage })
const cagnotteRoute = createRoute({ getParentRoute: () => appRoute, path: '/cagnotte', component: CagnottePage })
const reglesRoute = createRoute({ getParentRoute: () => appRoute, path: '/regles', component: ReglesPage })
const profilRoute = createRoute({ getParentRoute: () => appRoute, path: '/profil', component: ProfilPage })

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    indexRoute,
    matchsRoute,
    matchDetailRoute,
    classementRoute,
    bonusRoute,
    cagnotteRoute,
    reglesRoute,
    profilRoute,
  ]),
])

export const router = createRouter({ routeTree, basepath: '/six-cdm' })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
