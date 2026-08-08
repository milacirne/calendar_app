# Análise técnica do projeto atual

## Estrutura atual

Estrutura relevante atual:

```text
src/
├── assets/seasons/
├── components/
├── data/
├── hooks/
├── layouts/
├── pages/
├── services/
├── styles/
├── types/
└── utils/
```

Não existem pastas `api/`, `server/`, `routes/`, `controllers`, `contexts/` ou `mocks/` separadas.

Responsabilidades:

- `components/`: UI reutilizável: grade mensal, painel do dia, formulário, navegação de ano/mês, índice de RPs.
- `pages/`: página principal do calendário.
- `services/`: camada mock/abstração para auth, calendário, eventos pessoais e eventos oficiais.
- `data/`: dados estáticos: meses, dias da semana, semanas lunares, config temporal e RPs oficiais.
- `hooks/`: estado assíncrono de contexto de calendário e eventos.
- `types/`: tipos centrais.
- `utils/`: regras temporais, comparação de datas, permissões e indexação de eventos.
- `styles/`: CSS global.

## Stack

Verificado em `package.json`:

- React
- TypeScript
- Vite
- React Router DOM
- lucide-react
- CSS global comum

Não há:

- Express
- backend Node
- Vercel Functions
- `@vercel/blob`
- biblioteca HTTP como Axios
- state manager externo
- banco de dados
- storage client

## Fonte atual dos eventos

Existem duas fontes:

1. RPs pessoais/player

Fonte: `src/services/eventService.ts`  
Armazenamento atual: variável em memória `let mockEvents: CalendarEvent[]`.

2. RPs oficiais

Fonte inicial: `src/data/officialEvents.ts`  
Serviço de leitura: `src/services/officialEventService.ts`  
Armazenamento atual: array estático exportado como `initialOfficialEvents`.

O hook `src/hooks/useCalendarEvents.ts` junta as duas fontes:

```ts
const [personalEvents, officialEvents] = await Promise.all([
  getEventsForOwner(ownerId),
  getOfficialEvents()
]);

setEvents([...personalEvents, ...officialEvents]);
```

## Persistência atual

Ao adicionar uma RP pessoal:

1. O formulário chama o handler.
2. O handler chama `addEvent`.
3. `addEvent` chama `createEvent`.
4. `createEvent` adiciona no array `mockEvents`.
5. O hook adiciona o evento também no `useState`.

Se atualizar a página, a RP nova desaparece.

Motivo: `mockEvents` é uma variável em memória do bundle JavaScript. Ela não persiste reload, sessão, deploy ou troca de navegador.

Uso atual de storage:

- `localStorage`: não usado atualmente.
- `sessionStorage`: não usado.
- `IndexedDB`: não usado.
- filesystem runtime: não usado.
- backend/API: não existe.
- Vercel Blob: não instalado/não usado.

## Backend/API

Situação atual: **A) Não existe backend. Tudo acontece no frontend.**

Não há:

- pasta `api/`;
- pasta `server/`;
- `vercel.json`;
- Express;
- controllers/routes;
- Vercel Functions;
- chamadas `fetch`.

As funções em `services/` simulam uma camada de API, mas executam localmente no navegador.

## Services

### `src/services/authService.ts`

- `getAuthenticatedUser()`: retorna usuário mockado `123`.
- `getCalendarOwnerFromRequest()`: lê `?uid=` via `getForumUserId`.
- `resolvePermission()`: compara usuário autenticado com owner.
- `getCalendarContext()`: monta `authenticatedUser`, `owner`, `viewerId`, `permission`.
- Não usa `fetch`.
- Usa mocks internos `MOCK_AUTHENTICATED_USER`, `DEFAULT_OWNER`, `KNOWN_OWNERS`.

### `src/services/forumIdentity.ts`

- `getForumUserId(search = window.location.search)`.
- Lê `uid` da query string.

### `src/services/calendarService.ts`

- `getCalendarMetadata()`.
- Retorna meses, weekdays, lunarWeeks, anos mínimo/máximo, `CURRENT_DATE`, limite de criação.
- Atualmente parece preparado, mas não está sendo usado diretamente pela página principal.

### `src/services/eventService.ts`

- `getEventsForOwner(ownerId)`
- `getEventsForDate(ownerId, date)`
- `createEvent(ownerId, input)`
- `updateEvent(eventId, input)`
- `deleteEvent(eventId)`
- Usa `mockEvents` em memória.
- Não usa `fetch`.
- Não persiste.

### `src/services/officialEventService.ts`

- `getOfficialEvents()`
- Retorna `initialOfficialEvents` de `data/officialEvents.ts`.
- Não cria, edita ou exclui oficiais pela UI.
- Não usa storage.

## Mocks

### `src/services/eventService.ts`

Contém `mockEvents`, com RPs pessoais de owners `123` e `456`.

É fonte mutável em memória para criação/edição/exclusão de RPs pessoais.

### `src/data/officialEvents.ts`

Contém `initialOfficialEvents`, com RPs/eventos oficiais.

Editável por código, não pela interface.

### `src/services/authService.ts`

Contém usuário autenticado mockado e owners conhecidos mockados.

Dados estáticos de calendário:

- `src/data/months.ts`
- `src/data/weekdays.ts`
- `src/data/lunarWeeks.ts`
- `src/data/calendarConfig.ts`

## Fluxo de leitura

```text
CalendarPage
  ↓
useCalendarContext()
  ↓
authService.getCalendarContext()
  ↓
authService.getCalendarOwnerFromRequest()
  ↓
forumIdentity.getForumUserId()
```

Depois:

```text
CalendarPage
  ↓
useCalendarEvents(context.owner.id)
  ↓
getEventsForOwner(ownerId)
  ↓
eventService mockEvents pessoais

+
  ↓
getOfficialEvents()
  ↓
data/officialEvents.ts

+
  ↓
setEvents([...personalEvents, ...officialEvents])
```

A grade mensal recebe `events` por props em `CalendarGrid`.

O painel lateral recebe apenas os eventos da data selecionada via `getEventsForDate(selectedDate)`.

## Fluxo de criação

```text
DayPanel
  ↓
botão "Adicionar RP"
  ↓
isCreating = true
  ↓
EventForm
  ↓
handleSubmit()
  ↓
DayPanel onSubmit
  ↓
CalendarPage.guardedCreate(input)
  ↓
useCalendarEvents.addEvent(input)
  ↓
eventService.createEvent(ownerId, input)
  ↓
mockEvents = [...mockEvents, event]
  ↓
setEvents(current => [...current, created])
```

Validações atuais antes de criar:

- precisa ter `context`;
- precisa `permission === "owner"`;
- `isDateAvailable(input)` precisa ser true.

## Fluxo de edição

```text
DayPanel
  ↓
botão editar em evento personal
  ↓
editingEvent = event
  ↓
EventForm preenchido com dados atuais
  ↓
handleSubmit()
  ↓
CalendarPage.guardedUpdate(eventId, input)
  ↓
useCalendarEvents.editEvent(eventId, input)
  ↓
eventService.updateEvent(eventId, input)
  ↓
mockEvents = mockEvents.map(...)
  ↓
setEvents(current => current.map(...))
```

Eventos oficiais não têm botão de edição na UI.

## Fluxo de exclusão

```text
DayPanel
  ↓
botão excluir em evento personal
  ↓
CalendarPage.guardedDelete(eventId)
  ↓
useCalendarEvents.removeEvent(eventId)
  ↓
eventService.deleteEvent(eventId)
  ↓
mockEvents = mockEvents.filter(...)
  ↓
setEvents(current => current.filter(...))
```

Eventos oficiais não têm exclusão pela UI.

## Tipos principais

Definidos em `src/types/calendar.ts`:

```ts
interface PrythianDate {
  year: number;
  month: number;
  day: number;
}

type Permission = "owner" | "viewer" | "unauthenticated";

type EventStatus = "ongoing" | "completed" | "paused";

type EventType = "personal" | "official";

interface Participant {
  id: string;
  name: string;
}

interface CalendarEvent {
  id: string;
  ownerId: string;
  year: number;
  month: number;
  day: number;
  title: string;
  rpUrl: string;
  participants: Participant[];
  status: EventStatus;
  type: EventType;
  notes?: string;
}

type EventInput = Omit<CalendarEvent, "id" | "ownerId" | "type">;
```

Não existe tipo `Calendar` separado hoje. Existe `CalendarOwner`.

## Rotas

Definidas em `src/App.tsx`:

```text
/
* → redirect para /
```

Não existe rota:

```text
/calendar/:ownerId
```

O owner vem por query string `?uid=123`, não por path param.

## Identificação de usuário

Existe lógica parcial/mockada:

### `src/services/forumIdentity.ts`

```ts
getForumUserId()
```

Origem: `window.location.search`, parâmetro `uid`.

### `src/services/authService.ts`

- `MOCK_AUTHENTICATED_USER`: usuário logado mockado, id `123`.
- `getCalendarOwnerFromRequest()`: usa `uid` para definir o owner.
- `viewerId`: `authenticatedUser?.id ?? null`.
- `permission`: `"owner"` quando authenticated user e owner têm o mesmo id, senão `"viewer"`.

Estados derivados em `CalendarPage`:

- `context.owner.id`: owner do calendário.
- `context.viewerId`: usuário que está visualizando.
- `context.permission`: permissão de UI.

## Compatibilidade com Vercel

Hoje o projeto está preparado como frontend Vite estático.

Existe:

- `vite.config.ts` simples com React plugin.
- scripts `dev`, `build`, `preview`.
- `dist/` gerado localmente.

Não existe:

- `vercel.json`;
- pasta `api/`;
- Vercel Functions;
- `@vercel/blob`;
- variáveis de ambiente para Blob;
- endpoints serverless.

Para frontend React estático na Vercel, deve funcionar. Para **frontend + serverless functions + Vercel Blob**, será necessário adicionar API routes/serverless functions e instalar/configurar `@vercel/blob`.

## O que precisaria mudar para Vercel Blob

Pode ser mantido:

- componentes visuais;
- tipos principais, com talvez pequenos ajustes;
- lógica temporal em `utils/` e `data/calendarConfig.ts`;
- separação de services;
- hooks como `useCalendarEvents`, com troca da implementação interna;
- distinção `personal` vs `official`;
- query `?uid=` como entrada inicial.

Precisaria mudar:

- `eventService.ts`: deixar de usar `mockEvents` em memória e passar a chamar API.
- `officialEventService.ts`: se oficiais também forem para Blob no futuro, trocar leitura estática por API ou manter arquivo estático se a intenção for editar por código.
- criar camada backend/serverless, provavelmente `api/events` ou equivalente.
- persistência real para criar/editar/excluir RPs pessoais.
- validação server-side de owner/permissão/data disponível.
- estratégia de arquivo/blob: por owner, por calendário, ou arquivo único indexado.
- tratamento de concorrência: Blob não é banco relacional; precisa cuidado com leitura-modificação-escrita simultânea.
- autenticação real: hoje o frontend decide `permission`, mas isso não é seguro.

## Arquivos que provavelmente precisariam ser alterados

Prováveis alterações para Vercel Blob:

- `package.json`: adicionar `@vercel/blob`.
- novo `api/` ou estrutura equivalente: endpoints serverless.
- `src/services/eventService.ts`: trocar mock em memória por `fetch`.
- `src/hooks/useCalendarEvents.ts`: possivelmente manter assinatura, mas adaptar erros/loading.
- `src/services/authService.ts`: futuramente substituir mocks por integração real.
- `src/types/calendar.ts`: talvez adicionar tipos de payload/resposta.
- talvez `vercel.json`, se forem necessárias regras específicas.

Não parece necessário alterar profundamente:

- `CalendarGrid`
- `DayPanel`
- `EventForm`
- `MonthSelector`
- `YearNavigator`
- lógica temporal em `utils/calendar.ts` e `utils/dateComparison.ts`

# Resumo para enviar a outro desenvolvedor

Este é um app React + TypeScript + Vite, com React Router apenas para rota raiz `/` e fallback para `/`. Não há backend, API routes, Express, Vercel Functions ou Vercel Blob instalados. A aplicação é inteiramente frontend.

Os eventos pessoais são armazenados em memória no arquivo `src/services/eventService.ts`, numa variável `let mockEvents: CalendarEvent[]`. As funções `getEventsForOwner`, `createEvent`, `updateEvent` e `deleteEvent` manipulam esse array diretamente. Isso significa que eventos criados/editados/excluídos funcionam durante a sessão atual do navegador, mas desaparecem ao recarregar a página, porque não há persistência real.

Os eventos oficiais são separados dos pessoais. Eles ficam em `src/data/officialEvents.ts` como `initialOfficialEvents` e são lidos por `src/services/officialEventService.ts`. A interface não cria, edita ou exclui eventos oficiais; eles são editados por código. O calendário renderiza eventos pessoais e oficiais juntos, mas a seção “RPs registradas” filtra apenas eventos `type: "personal"`.

O hook `src/hooks/useCalendarEvents.ts` é o ponto central de leitura para a UI. Ele carrega eventos pessoais via `eventService.getEventsForOwner(ownerId)` e eventos oficiais via `officialEventService.getOfficialEvents()`, junta tudo em `events` com `useState`, e expõe `addEvent`, `editEvent`, `removeEvent` para eventos pessoais. A página principal `CalendarPage` passa esses handlers para `DayPanel`, que abre `EventForm`.

A identificação do calendário é mockada. `src/services/forumIdentity.ts` lê `?uid=` da URL. `src/services/authService.ts` define um usuário autenticado mockado `123` e owners conhecidos. A permissão é `"owner"` quando o usuário autenticado tem o mesmo id do owner do calendário; caso contrário é `"viewer"`. Essa permissão só controla a UI e não é segurança real.

Para migrar para Vercel Blob, a estrutura de componentes e tipos pode ser preservada. A principal mudança deve ser substituir o armazenamento em memória de `eventService.ts` por chamadas `fetch` para endpoints serverless em `api/`, e esses endpoints usariam `@vercel/blob` para ler/escrever os dados. Será necessário adicionar `@vercel/blob`, criar endpoints para listar/criar/editar/excluir eventos pessoais e mover as validações críticas para o backend. Oficiais podem continuar em arquivo estático se a staff quiser editar por código, ou também migrar para Blob se desejarem edição dinâmica futura.
