# open-pr

Abre um Pull Request no GitHub com as mudanças da branch atual em relação à main.

## Passos

1. Rode em paralelo:
   - `git status` — confirmar que não há mudanças não commitadas
   - `git branch --show-current` — nome da branch atual
   - `git log main..HEAD --oneline` — todos os commits que entrarão no PR
   - `git diff main...HEAD` — diff completo para entender o escopo
2. Se houver mudanças não commitadas, execute o skill `/commit` antes de continuar
3. Verifique se a branch tem upstream: `git remote -v` e `git push -u origin HEAD` se necessário
4. Analise TODOS os commits (não só o último) e escreva:
   - **Título**: ação imperativa em português, máx 70 chars
   - **Resumo**: 2-4 bullet points do que foi feito e por quê
   - **Plano de teste**: checklist do que testar manualmente
5. Crie o PR com `gh pr create`

## Regras

- Nunca force-push para main/master
- O título deve refletir o conjunto de mudanças, não só o último commit
- Se a branch se chama `main` ou `master`, avise e peça confirmação antes de abrir o PR

## Template do PR

```
gh pr create --title "<título>" --body "$(cat <<'EOF'
## O que foi feito
- <bullet>
- <bullet>

## Por que
<contexto ou motivação>

## Como testar
- [ ] <passo 1>
- [ ] <passo 2>

🤖 Gerado com [Claude Code](https://claude.ai/claude-code)
EOF
)"
```
