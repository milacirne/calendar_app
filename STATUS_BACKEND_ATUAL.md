# Status atual do backend e persistência

Este arquivo resume a situação atual do projeto após a introdução da persistência das RPs pessoais com Vercel Blob.

## Visão geral

O projeto agora continua sendo um app React + TypeScript + Vite no frontend, mas passou a ter uma camada serverless simples em `api/` para persistir RPs pessoais.

Arquitetura atual:

```text
React
  ↓
src/services/eventService.ts
  ↓
fetch
  ↓
api/calendars/[ownerId]/...
  ↓
api/_lib/calendarStorage.ts
  ↓
Vercel Blob
```

Eventos oficiais continuam fora do Blob:

```text
src/data/officialEvents.ts
  ↓
src/services/officialEventService.ts
```

## O que já foi implementado

- `@vercel/blob` foi instalado.
- `.env.example` foi criado com `BLOB_READ_WRITE_TOKEN=`.
- A pasta `api/` foi criada para Vercel Functions.
- A camada `api/_lib/calendarStorage.ts` centraliza acesso ao Blob.
- RPs pessoais não usam mais `mockEvents` em memória.
- `src/services/eventService.ts` agora chama a API via `fetch`.
- `src/hooks/useCalendarEvents.ts` continua juntando RPs pessoais da API com RPs oficiais locais.
- Escrita envia `viewerId` via header `X-Viewer-Id`.
- API bloqueia escrita quando `viewerId !== ownerId`.
- GET não bloqueia leitura.
- Eventos oficiais seguem somente leitura na UI e editáveis por código.

## Dependências

Dependência nova:

```json
"@vercel/blob": "^2.7.0"
```

Não foram adicionados:

- Express
- servidor Node separado
- banco relacional
- ORM
- autenticação própria
- JWT/OAuth

## Arquivos de backend criados

```text
api/
├── _lib/
│   └── calendarStorage.ts
└── calendars/
    └── [ownerId]/
        └── events.ts
        └── events/
            └── [eventId].ts
```

## Endpoints atuais

### GET `/api/calendars/:ownerId/events`

Carrega as RPs pessoais do calendário.

Se o JSON ainda não existir no Blob, retorna:

```json
{
  "ownerId": "123",
  "events": []
}
```

Não exige `viewerId`.

### POST `/api/calendars/:ownerId/events`

Cria uma RP pessoal.

Exige:

```text
X-Viewer-Id: <viewerId>
```

Permite escrita somente se:

```text
viewerId === ownerId
```

Gera:

- `id` via `crypto.randomUUID()`;
- `ownerId` vindo da rota;
- `type: "personal"`.

### PUT `/api/calendars/:ownerId/events/:eventId`

Edita uma RP pessoal existente.

Exige:

```text
X-Viewer-Id: <viewerId>
```

Retorna:

- `200` com evento atualizado;
- `403` se `viewerId !== ownerId`;
- `404` se o evento não existir.

Impede alteração efetiva de:

- `id`;
- `ownerId`;
- `type`.

### DELETE `/api/calendars/:ownerId/events/:eventId`

Remove uma RP pessoal existente.

Exige:

```text
X-Viewer-Id: <viewerId>
```

Retorna:

- `200 { "ok": true }`;
- `403` se `viewerId !== ownerId`;
- `404` se o evento não existir.

## Estrutura no Vercel Blob

Um arquivo JSON por owner/personagem:

```text
calendars/<ownerId>.json
```

Exemplo:

```text
calendars/123.json
```

Formato:

```json
{
  "ownerId": "123",
  "events": [
    {
      "id": "uuid",
      "ownerId": "123",
      "year": 447,
      "month": 1,
      "day": 1,
      "title": "Uma noite em Velaris",
      "rpUrl": "https://forum.example.com/topic/teste",
      "participants": [
        {
          "id": "rhysand",
          "name": "Rhysand"
        }
      ],
      "status": "ongoing",
      "type": "personal",
      "notes": "Noite • RP fechada"
    }
  ]
}
```

O Blob está configurado no código com:

```ts
access: "private"
```

## Validações server-side atuais

Implementadas em `api/_lib/calendarStorage.ts`.

Valida:

- `ownerId` com padrão simples: letras, números, `_` e `-`;
- `year` inteiro entre `MIN_YEAR` e `CURRENT_DATE.year`;
- `month` inteiro entre `1` e `12`;
- `day` inteiro entre `1` e `28`;
- data disponível via `isDateAvailable`;
- `title` obrigatório;
- `rpUrl` obrigatório e URL válida;
- `status` entre `ongoing`, `completed`, `paused`;
- `participants` array não vazio;
- cada participante precisa ter `name`;
- evento salvo sempre como `type: "personal"`.

## Fluxo atual de leitura

```text
CalendarPage
  ↓
useCalendarEvents(ownerId, viewerId)
  ↓
eventService.getEventsForOwner(ownerId)
  ↓
GET /api/calendars/:ownerId/events
  ↓
calendarStorage.getCalendar(ownerId)
  ↓
Vercel Blob: calendars/<ownerId>.json
```

Em paralelo:

```text
useCalendarEvents
  ↓
officialEventService.getOfficialEvents()
  ↓
src/data/officialEvents.ts
```

Depois:

```ts
setEvents([...personalEvents, ...officialEvents]);
```

## Fluxo atual de criação

```text
DayPanel
  ↓
EventForm
  ↓
CalendarPage.guardedCreate(input)
  ↓
useCalendarEvents.addEvent(input)
  ↓
eventService.createEvent(ownerId, viewerId, input)
  ↓
POST /api/calendars/:ownerId/events
  ↓
X-Viewer-Id
  ↓
calendarStorage.createEvent(ownerId, input)
  ↓
Blob: put calendars/<ownerId>.json
```

Depois do retorno, o hook atualiza `events` no estado local.

## Fluxo atual de edição

```text
DayPanel
  ↓
EventForm com evento existente
  ↓
CalendarPage.guardedUpdate(eventId, input)
  ↓
useCalendarEvents.editEvent(eventId, input)
  ↓
eventService.updateEvent(ownerId, viewerId, eventId, input)
  ↓
PUT /api/calendars/:ownerId/events/:eventId
  ↓
calendarStorage.updateEvent(ownerId, eventId, input)
  ↓
Blob: put calendars/<ownerId>.json
```

## Fluxo atual de exclusão

```text
DayPanel
  ↓
Botão excluir em RP pessoal
  ↓
CalendarPage.guardedDelete(eventId)
  ↓
useCalendarEvents.removeEvent(eventId)
  ↓
eventService.deleteEvent(ownerId, viewerId, eventId)
  ↓
DELETE /api/calendars/:ownerId/events/:eventId
  ↓
calendarStorage.deleteEvent(ownerId, eventId)
  ↓
Blob: put calendars/<ownerId>.json
```

## Frontend alterado para backend

### `src/services/eventService.ts`

Agora é uma camada HTTP.

Expõe:

```ts
getEventsForOwner(ownerId)
getEventsForDate(ownerId, date)
createEvent(ownerId, viewerId, input)
updateEvent(ownerId, viewerId, eventId, input)
deleteEvent(ownerId, viewerId, eventId)
```

Também detecta quando `/api` retorna HTML em vez de JSON e mostra erro sugerindo `npx vercel dev`.

### `src/hooks/useCalendarEvents.ts`

Agora recebe:

```ts
useCalendarEvents(ownerId, viewerId)
```

Mantém:

```ts
setEvents([...personalEvents, ...officialEvents]);
```

### `src/pages/CalendarPage.tsx`

Passa:

```ts
context.owner.id
context.viewerId
```

para `useCalendarEvents`.

Também exibe `eventsError` quando a API falha.

## Identidade atual

Ainda é mockada.

### `src/services/forumIdentity.ts`

Lê:

```text
?uid=<ownerId>
?viewer=<viewerId>
```

### `src/services/authService.ts`

Ainda usa mock local, mas agora aceita `viewer` da URL para simular o usuário logado.

Exemplos de teste:

```text
/?uid=123&viewer=123
```

Resultado esperado:

```text
pode criar, editar e excluir RPs pessoais
```

```text
/?uid=456&viewer=123
```

Resultado esperado:

```text
pode visualizar, mas não pode criar/editar/excluir
```

A API também deve retornar `403` se alguém tentar escrever no segundo cenário.

## Configuração local

Arquivo criado:

```text
.env.example
```

Conteúdo:

```env
BLOB_READ_WRITE_TOKEN=
```

Para desenvolvimento real:

```text
.env.local
```

com:

```env
BLOB_READ_WRITE_TOKEN=token_real
```

O token não deve usar prefixo `VITE_`.

## Como rodar localmente

Para testar frontend + Vercel Functions:

```bash
npx vercel dev
```

Importante:

```bash
npm run dev
```

roda somente o Vite e não serve a pasta `api/`.

Se usar apenas `npm run dev`, o frontend tenta chamar `/api/...`, recebe `index.html` e pode mostrar erro de API não JSON.

## Deploy na Vercel

Passos necessários:

1. Criar ou conectar um Blob Store no projeto da Vercel.
2. Garantir a variável:

```text
BLOB_READ_WRITE_TOKEN
```

3. Fazer deploy.
4. Criar uma RP pessoal pela UI.
5. Verificar no painel do Blob se foi criado:

```text
calendars/<ownerId>.json
```

## Verificações já feitas

Foi executado:

```bash
npm run build
```

Resultado: passou.

Também foi executada checagem TypeScript específica dos arquivos em `api/`.

Resultado: passou.

## O que ainda falta fazer no backend

### 1. Configurar Blob Store real

Ainda precisa:

- criar/conectar Blob Store na Vercel;
- configurar `BLOB_READ_WRITE_TOKEN` em local e produção;
- confirmar se o store private está funcionando como esperado.

### 2. Testar CRUD real com `vercel dev`

Ainda precisa testar com token real:

- GET calendário vazio;
- POST criando RP;
- PUT editando RP;
- DELETE removendo RP;
- reload mantendo a RP;
- owner `123` com viewer `123`;
- owner `456` com viewer `123` retornando `403`.

### 3. Integração real com JCink

Ainda está mockado.

Próxima etapa:

- receber `uid` como ownerId real do perfil;
- receber `viewer` como usuário logado real;
- substituir o mock do `authService`;
- garantir que o botão do Main Profile abra a URL correta.

### 4. Segurança real

Hoje a segurança é funcional, mas simples:

```text
viewerId === ownerId
```

Isso não é autenticação forte.

Ainda não há:

- assinatura do JCink;
- token seguro;
- sessão;
- prova de identidade;
- validação criptográfica.

### 5. Concorrência

O Blob usa leitura-modificação-escrita do JSON inteiro.

Ainda falta decidir se será necessário lidar com conflitos quando duas escritas acontecerem ao mesmo tempo.

Para o uso inicial, provavelmente é aceitável.

### 6. Tipagem dos handlers serverless

Os handlers usam `req: any` e `res: any`.

Funciona para Vercel Functions, mas pode ser melhorado depois com tipos específicos.

### 7. Tratamento visual de erros de escrita

O hook já captura erro de carregamento.

Mas erros ao criar/editar/excluir ainda sobem pelo fluxo do formulário. Pode ser melhorado depois com mensagem local no formulário/painel.

### 8. Migração de dados mockados antigos

Os mocks pessoais antigos foram removidos como fonte de verdade.

Se quiser manter exemplos iniciais para owners novos, será necessário decidir:

- não criar seed nenhum;
- criar seed manual no Blob;
- ou ter uma função de bootstrap.

Atualmente calendário novo começa vazio.

## O que não precisa mexer agora

- Eventos oficiais.
- Layout do calendário.
- Lógica temporal.
- Meses/dias/semanas lunares.
- Destaques visuais.
- Índice de RPs registradas.
- Estrutura de componentes.

## Resumo curto

O backend mínimo já existe.

RPs pessoais agora passam por:

```text
frontend → eventService fetch → Vercel Function → Vercel Blob
```

Eventos oficiais continuam locais.

O que falta para backend estar realmente pronto é configurar o Blob Store real, testar com `vercel dev`, validar CRUD com token real e implementar a próxima etapa da identidade JCink.
