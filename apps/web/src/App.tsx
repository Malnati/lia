import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Cloud,
  Database,
  GitBranch,
  Layers3,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  MonitorCog,
  LayoutDashboard
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'https://api.aneety.com').replace(/\/$/, '');

type ServiceStatus = 'checking' | 'ok' | 'error';

type ServiceCheck = {
  key: 'api' | 'database';
  label: string;
  href: string;
  icon: typeof Activity;
  status: ServiceStatus;
  detail: string;
};

type HealthResponse = {
  status?: string;
  runtime?: string;
  framework?: string;
  configured?: boolean;
  checkedAt?: string;
};

const surfaces = [
  {
    name: 'Portal Lia',
    repo: 'Malnati/lia',
    href: 'https://aneety.com/',
    responsibility: 'Orquestrador, contrato REQ.md, status público e navegação.',
    icon: Layers3
  },
  {
    name: 'API Worker/Hono',
    repo: 'Malnati/lia-backend',
    href: 'https://api.aneety.com/api/health',
    responsibility: 'API real Cloudflare Workers Free conectada ao Supabase/Postgres.',
    icon: Cloud
  },
  {
    name: 'Lia Core',
    repo: 'Malnati/lia-core',
    href: 'https://core.aneety.com/',
    responsibility: 'Contratos, roles, permissões e tokens compartilháveis.',
    icon: GitBranch
  },
  {
    name: 'Lia PWA',
    repo: 'Malnati/lia-pwa',
    href: 'https://pwa.aneety.com/',
    responsibility: 'Operação mobile/offline-first em repositório próprio.',
    icon: Smartphone
  },
  {
    name: 'Lia Desktop',
    repo: 'Malnati/lia-desktop',
    href: 'https://desktop.aneety.com/',
    responsibility: 'Operação desktop de atendimento, produção e logística.',
    icon: MonitorCog
  },
  {
    name: 'Lia Dashboard',
    repo: 'Malnati/lia-dashboard',
    href: 'https://dashboard.aneety.com/',
    responsibility: 'Administração, usuários, perfis, tenants e permissões.',
    icon: LayoutDashboard
  }
];

const requirements = [
  'Supabase/Postgres real com RLS como fonte de dados operacional.',
  'Supabase Auth nos frontends; service role apenas em Cloudflare Worker secret.',
  'API real Cloudflare Workers Free + Hono em api.aneety.com.',
  'Frontends React/Vite/TypeScript/Tailwind com shadcn/ui por repositório.',
  'Publicação independente por repo em aneety.com, sem Containers, VPS ou serviços pagos.',
  'E2E somente contra URLs públicas aneety.com.'
];

const nextCoverage = [
  'Login Supabase Auth publicado.',
  'CRUD usuários/perfis no dashboard via Worker + RLS.',
  'Pedido, checkpoints, anexos, pagamento e sync real via Postgres.',
  'Estados visíveis shadcn para loading, erro, vazio e sucesso.'
];

export default function App() {
  const [checks, setChecks] = useState<ServiceCheck[]>(() => createInitialChecks());
  const [updatedAt, setUpdatedAt] = useState<string>('Verificando agora');

  async function refreshStatus() {
    setChecks(createInitialChecks());
    const [health, dbHealth] = await Promise.allSettled([
      fetchJson(`${apiBaseUrl}/api/health`),
      fetchJson(`${apiBaseUrl}/api/db/health`)
    ]);

    setChecks([
      health.status === 'fulfilled' && health.value.status === 'ok'
        ? {
            key: 'api',
            label: 'Worker/Hono',
            href: `${apiBaseUrl}/api/health`,
            icon: Cloud,
            status: 'ok',
            detail: `${health.value.runtime ?? 'cloudflare-workers'} + ${health.value.framework ?? 'hono'}`
          }
        : {
            key: 'api',
            label: 'Worker/Hono',
            href: `${apiBaseUrl}/api/health`,
            icon: Cloud,
            status: 'error',
            detail: 'API pública não retornou status=ok.'
          },
      dbHealth.status === 'fulfilled' && dbHealth.value.status === 'ok' && dbHealth.value.configured === true
        ? {
            key: 'database',
            label: 'Supabase/Postgres',
            href: `${apiBaseUrl}/api/db/health`,
            icon: Database,
            status: 'ok',
            detail: 'SUPABASE_SERVICE_ROLE_KEY configurado no Worker; db/health OK.'
          }
        : {
            key: 'database',
            label: 'Supabase/Postgres',
            href: `${apiBaseUrl}/api/db/health`,
            icon: Database,
            status: 'error',
            detail: 'db/health não confirmou status=ok/configured=true.'
          }
    ]);
    setUpdatedAt(new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()));
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  const allHealthy = useMemo(() => checks.every((check) => check.status === 'ok'), [checks]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>aneety.com</Badge>
                <Badge variant="outline">Cloudflare Free</Badge>
                <Badge variant="outline">Supabase Free</Badge>
                <Badge variant="outline">shadcn/ui</Badge>
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                  Lia — portal integrador da plataforma real
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                  Este repositório orquestra a plataforma multi-repo. O backend real roda em Cloudflare Workers + Hono e persiste no Supabase/Postgres com Auth e RLS.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg">
                <a href="https://dashboard.aneety.com/">
                  Abrir dashboard
                  <ArrowUpRight />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://api.aneety.com/api/health">
                  Ver API
                  <ArrowUpRight />
                </a>
              </Button>
            </div>
          </div>

          <Alert>
            <ShieldCheck />
            <AlertTitle>Arquitetura vigente única</AlertTitle>
            <AlertDescription>
              Sem NestJS, VPS, Render, MongoDB/Mongoose, GridFS ou backend browser-local como alvo. Critérios de aceite usam Worker/Hono, Supabase/Postgres real e URLs públicas em aneety.com.
            </AlertDescription>
          </Alert>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {checks.map((check) => (
            <StatusCard key={check.key} check={check} />
          ))}
        </section>

        <Tabs defaultValue="apps" className="flex flex-col gap-4">
          <TabsList className="w-full justify-start overflow-x-auto md:w-fit">
            <TabsTrigger value="apps">Apps publicados</TabsTrigger>
            <TabsTrigger value="requirements">Checklist REQ.md</TabsTrigger>
            <TabsTrigger value="coverage">Próxima cobertura</TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {surfaces.map((surface) => (
              <SurfaceCard key={surface.repo} surface={surface} />
            ))}
          </TabsContent>

          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Checklist rastreável do contrato</CardTitle>
                <CardDescription>Itens derivados de REQ.md para validação contínua do monitor.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 md:grid-cols-2">
                  {requirements.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                      <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coverage">
            <Card>
              <CardHeader>
                <CardTitle>Evolução segura</CardTitle>
                <CardDescription>Não ampliar E2E sem manter docs, smoke, Cloudflare, Supabase, shadcn e E2E existentes verdes.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="grid gap-3 md:grid-cols-2">
                  {nextCoverage.map((item, index) => (
                    <li key={item} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="flex flex-col gap-3 rounded-2xl border bg-card p-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>Status público: {allHealthy ? 'API e banco saudáveis' : 'verificação em andamento ou com erro'} · atualizado em {updatedAt}</span>
          <Button variant="outline" size="sm" onClick={() => void refreshStatus()}>
            <RefreshCw />
            Atualizar status
          </Button>
        </footer>
      </section>
    </main>
  );
}

function createInitialChecks(): ServiceCheck[] {
  return [
    {
      key: 'api',
      label: 'Worker/Hono',
      href: `${apiBaseUrl}/api/health`,
      icon: Cloud,
      status: 'checking',
      detail: 'Consultando health público da API.'
    },
    {
      key: 'database',
      label: 'Supabase/Postgres',
      href: `${apiBaseUrl}/api/db/health`,
      icon: Database,
      status: 'checking',
      detail: 'Consultando db/health via Worker.'
    }
  ];
}

async function fetchJson(url: string): Promise<HealthResponse> {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`GET ${url} failed with ${response.status}`);
  return response.json() as Promise<HealthResponse>;
}

function StatusCard({ check }: { check: ServiceCheck }) {
  const Icon = check.icon;
  const badgeVariant = check.status === 'error' ? 'destructive' : check.status === 'ok' ? 'default' : 'outline';
  const badgeLabel = check.status === 'checking' ? 'verificando' : check.status;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4" />
          {check.label}
        </CardTitle>
        <CardDescription>{check.href}</CardDescription>
        <CardAction>
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{check.detail}</p>
      </CardContent>
    </Card>
  );
}

function SurfaceCard({ surface }: { surface: (typeof surfaces)[number] }) {
  const Icon = surface.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4" />
          {surface.name}
        </CardTitle>
        <CardDescription>{surface.repo}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{surface.responsibility}</p>
        <Separator />
        <Button asChild variant="outline" size="sm" className="w-fit">
          <a href={surface.href}>
            Abrir superfície
            <ArrowUpRight />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
