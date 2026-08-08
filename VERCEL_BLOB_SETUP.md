# Vercel Blob - configuração e teste

Este projeto usa Vercel Blob somente para persistir RPs pessoais (`type: "personal"`).

Eventos oficiais continuam vindo de:

```text
src/data/officialEvents.ts
```

## Variável de ambiente

Crie um arquivo local:

```text
.env.local
```

com:

```env
BLOB_READ_WRITE_TOKEN=seu_token_real_aqui
```

Nunca use `VITE_` para esse token. Ele deve existir somente no ambiente server-side.

## Criar/conectar Blob Store na Vercel

1. Abra o projeto na Vercel.
2. Vá em `Storage`.
3. Crie um Blob Store.
4. Escolha `Private`.
5. Conecte o store ao projeto.
6. Garanta que `BLOB_READ_WRITE_TOKEN` esteja disponível nos ambientes desejados.

## Rodar localmente

Para testar frontend + Vercel Functions, use:

```bash
npx vercel dev
```

`npm run dev` roda apenas o Vite e não serve a pasta `api/`.

## Endpoints

```text
GET    /api/calendars/:ownerId/events
POST   /api/calendars/:ownerId/events
PUT    /api/calendars/:ownerId/events/:eventId
DELETE /api/calendars/:ownerId/events/:eventId
```

Para escrita, envie:

```text
X-Viewer-Id: <viewerId>
```

A API permite escrita somente quando:

```text
viewerId === ownerId
```

## Estrutura no Blob

Um JSON por calendário/personagem:

```text
calendars/123.json
```

Formato:

```json
{
  "ownerId": "123",
  "events": []
}
```

## Testes manuais

Leitura de calendário vazio:

```bash
curl http://localhost:3000/api/calendars/123/events
```

Criação:

```bash
curl -X POST http://localhost:3000/api/calendars/123/events \
  -H "Content-Type: application/json" \
  -H "X-Viewer-Id: 123" \
  -d "{\"year\":447,\"month\":1,\"day\":1,\"title\":\"Teste\",\"rpUrl\":\"https://forum.example.com/topic/teste\",\"participants\":[{\"id\":\"rhysand\",\"name\":\"Rhysand\"}],\"status\":\"ongoing\"}"
```

Teste de permissão:

```bash
curl -X POST http://localhost:3000/api/calendars/456/events \
  -H "Content-Type: application/json" \
  -H "X-Viewer-Id: 123" \
  -d "{\"year\":447,\"month\":1,\"day\":1,\"title\":\"Teste\",\"rpUrl\":\"https://forum.example.com/topic/teste\",\"participants\":[{\"id\":\"rhysand\",\"name\":\"Rhysand\"}],\"status\":\"ongoing\"}"
```

Resultado esperado:

```text
403 Forbidden
```

## Deploy

1. Configure o Blob Store na Vercel.
2. Confirme `BLOB_READ_WRITE_TOKEN` nas variáveis do projeto.
3. Faça deploy normalmente.
4. Crie uma RP pessoal pela UI.
5. Verifique no painel do Blob se foi criado:

```text
calendars/<ownerId>.json
```

## Ainda mockado

- Usuário autenticado.
- Integração real com JCink.
- Leitura final de `ownerId`/`viewerId` a partir do botão do Main Profile.

A próxima etapa é substituir o mock de identidade pelo fluxo real do JCink.
