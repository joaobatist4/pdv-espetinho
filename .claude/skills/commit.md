# commit

Cria um commit git com todas as mudanças staged e unstaged do repositório.

## Passos

1. Rode `git status` e `git diff` em paralelo para ver o estado atual
2. Rode `git log --oneline -5` para entender o estilo de mensagem do projeto
3. Analise as mudanças e escreva uma mensagem de commit clara e concisa:
   - Primeira linha: resumo imperativo em português, máx 72 chars (ex: "Adiciona endpoint de toggle para mesas")
   - Se necessário, corpo com contexto adicional separado por linha em branco
4. Adicione os arquivos relevantes com `git add` (prefira arquivos específicos, nunca `git add .` se houver risco de incluir `.env` ou secrets)
5. Crie o commit

## Regras

- Nunca commite `.env`, `appsettings.*.json` com secrets, ou arquivos listados no `.gitignore`
- Nunca use `--no-verify`
- Se o hook de pre-commit falhar, corrija o problema e crie um NOVO commit (nunca `--amend`)
- Mensagem sempre em português
- Termine a mensagem com: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

## Exemplo de mensagem

```
Adiciona endpoint de toggle para produtos, mesas e usuários

Implementa PATCH /{id}/toggle nos três controllers.
Adiciona método Toggle() nas entidades de domínio.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
