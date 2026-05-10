# PDV Espetim do Bigode — Guia para o Claude

## Contexto do projeto

PDV (ponto de venda) para espetinharia. Repositório único com `backend/` e `frontend/`. Aplicação real em uso operacional — estabilidade e clareza têm prioridade sobre experimentação.

**Regra principal: perguntar antes de qualquer alteração não solicitada explicitamente.**

---

## Backend — `backend/src/`

### Stack
- .NET 10, ASP.NET Core (controllers convencionais, não Minimal API)
- PostgreSQL + EF Core + Npgsql
- MediatR 14, FluentResults 4, FluentValidation 12, BCrypt.Net-Next

### Estrutura de projetos

| Projeto | Responsabilidade |
|---|---|
| `PdvEspetinho.Domain` | Entidades ricas, enums, interfaces de repositório, eventos de domínio. Zero dependências externas. |
| `PdvEspetinho.Infra.Data` | EF Core, mappings, repositórios, migrations, seed |
| `PdvEspetinho.Infra.Services` | Serviços externos (email via MailKit, etc.) |
| `PdvEspetinho.Application` | Handlers MediatR organizados por feature. Nunca lança exceções — retorna `Result<T>`. |
| `PdvEspetinho.QueryStack` | Consultas de tela com Dapper + Npgsql direto. DTOs de leitura. |
| `PdvEspetinho.Api` | Controllers, JWT, SignalR hub, middleware de erro |

### Convenções

**Banco de dados:**
- Entidades em C#: `PascalCase`
- Tabelas e colunas no banco: `snake_case` — mapeados manualmente em cada `IEntityTypeConfiguration`, não via convenção global

**Camada Application:**
- Nunca lançar exceções — retornar `Result.Fail(...)` ou `Result.Ok(...)`
- Cada handler faz uma única operação
- Se o controller precisar de múltiplas operações, ele orquestra os handlers
- Validações via `FluentValidation` no pipeline do MediatR (`ValidationBehavior`)
- Organização por feature: `Features/{Modulo}/Commands/{Operacao}/`

**Camada QueryStack:**
- Usa Dapper com Npgsql direto (SQLKata foi descartado — API v4 incompatível)
- Apenas leitura — nunca escreve no banco
- Cada query é uma classe com método `ExecuteAsync`

**Domain:**
- Modelagem rica — entidades são responsáveis pelas suas próprias operações
- `OrderItem.Create(...)` é `internal` — só `Order.AddItems(...)` cria itens
- Eventos de domínio publicados dentro das entidades, limpos pelo repositório após salvar

**Api:**
- Controllers retornam `BadRequest` quando `result.IsFailed`, `Ok` quando `result.IsSuccess`
- JWT com claims: `userId`, `role`, `permission` (um claim por permissão)
- SignalR hub em `/hubs/kitchen` — eventos `NewOrder` e `ItemStatusChanged`

---

## Frontend — `frontend/`

### Stack
- React 19 + TypeScript 5 + Vite 6
- TanStack Query v5 (= React Query renomeado) para server state
- Zustand v5 para client state (auth e carrinho PDV)
- Tailwind CSS v4 via `@tailwindcss/vite`
- Recharts para gráficos
- `@microsoft/signalr` para display da cozinha

### Estrutura

```
src/
  features/         # Uma pasta por módulo de negócio
  hooks/            # Hooks reutilizáveis
  lib/              # api.ts, queryClient.ts, utils.ts
  services/         # Funções de chamada à API por domínio
  stores/           # Zustand: auth.store.ts, cart.store.ts
  types/            # Tipos TypeScript espelhando os DTOs do backend
```

### Convenções

- Variáveis de ambiente via `import.meta.env.VITE_*`
- Em dev, Vite faz proxy de `/api` e `/hubs` para `VITE_API_URL`
- Apenas `.env.example` vai pro git — `.env` está no `.gitignore`
- Impressão da comandinha de cozinha via `window.print()` com CSS `@media print` para papel 80mm (classe `print-area`)

---

## Funcionalidades implementadas

| Módulo | Rota | Permissão |
|---|---|---|
| Login | `/login` | — |
| PDV / Caixa | `/` | `Pdv` |
| Pedidos | `/pedidos` | `Pedidos` |
| Cozinha (KDS) | `/cozinha` | — (público) |
| Estoque | `/estoque` | `Estoque` |
| Cadastro | `/cadastro` | `Cadastro` |
| Dashboard | `/dashboard` | `Dashboard` |

**Fluxo PDV:**
1. Seleciona mesa → cria `Order` no backend
2. Adiciona itens ao carrinho → envia à cozinha (`AddOrderItems`)
3. Impressão da comandinha via `KitchenTicketPrint` (`window.print`)
4. Fecha conta com multi-pagamento (`CloseOrder`) → cria `Sale` + `SalePayment`

**Cozinha:**
- Atualização em tempo real via SignalR (`useKitchenHub`)
- Eventos: `NewOrder` e `ItemStatusChanged`

---

## Comandos úteis

```bash
# Backend
dotnet build backend/PdvEspetinho.sln
dotnet run --project backend/src/PdvEspetinho.Api

# Migrations
dotnet ef migrations add <Nome> -p backend/src/PdvEspetinho.Infra.Data -s backend/src/PdvEspetinho.Api
dotnet ef database update -p backend/src/PdvEspetinho.Infra.Data -s backend/src/PdvEspetinho.Api

# Frontend
cd frontend
npm run dev
npm run build
```

## Seed inicial

Na primeira execução da API, o `DataSeeder` cria automaticamente:
- Usuário admin: `admin@espetim.com` / `admin123`
- Categorias do cardápio

**Trocar a senha do admin após o primeiro login.**
