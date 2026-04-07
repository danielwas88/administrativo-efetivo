# Plano de Desenvolvimento - Sistema de Gestão de Efetivo PM

## Análise de Referência Visual

A referência visual (DCC PMDF) apresenta:
- **Fundo**: Azul royal profundo (#001a4d ou similar)
- **Linhas técnicas**: Brancas e azuis, formando grid e frames retangulares
- **Tipografia**: Sans-serif branca em negrito, alta legibilidade
- **Padrão**: Linhas tracejadas vermelhas e azuis imitando desenhos técnicos/CAD
- **Elementos**: Marcadores de dimensão, frames retangulares, grid técnico sutil
- **Hierarquia**: Estruturada, com seções bem definidas e separadas por linhas

## Arquitetura Técnica

### Stack
- **Frontend**: React 19 + Tailwind 4 + TypeScript
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL com Drizzle ORM
- **Auth**: Manus OAuth com roles (admin, gestor, visualizador)
- **LLM**: Integração com API Manus para análises

### Tabelas Principais

1. **militares** - Dados completos de cada policial
2. **afastamentos** - Registro de férias, licenças, etc.
3. **tipos_afastamento** - Tipos disponíveis (férias, abono, etc.)
4. **escalas** - Escala de serviço
5. **historico_acoes** - Auditoria de todas as operações
6. **alertas** - Notificações automáticas
7. **restricoes_medicas** - Restrições de saúde
8. **conflitos_escala** - Conflitos na escala
9. **horas_extras** - Controle de horas
10. **compensacoes** - Compensações de horas

## Funcionalidades Prioritárias

### Fase 1: MVP (CRUD + Dashboard)
- [x] Schema de banco de dados
- [ ] Autenticação com roles
- [ ] CRUD de militares
- [ ] Dashboard com estatísticas básicas
- [ ] Estética blueprint

### Fase 2: Avançado
- [ ] Exportação/Importação
- [ ] Gestão de afastamentos
- [ ] Histórico de ações
- [ ] Alertas automáticos

### Fase 3: Inteligência
- [ ] Análises com LLM
- [ ] Insights automáticos
- [ ] Previsões de pessoal

## Campos de Militares

```
- nome_guerra
- posto_grad
- nome
- matrícula
- data_nascimento
- data_inclusão
- função
- regime_escala
- esqd_seç
- mês_férias
- mês_abono
- cidade_residência
- cpf
- email
- telefone
- genero
- data_admissão
- ativo
- porteArma
- validadeBienal
- validadeIdentidadeMilitar
- validadeCnh
```

## Próximos Passos

1. Atualizar schema.ts com todas as tabelas
2. Gerar e aplicar migrations SQL
3. Implementar autenticação com roles
4. Desenvolver CRUD de militares
5. Criar dashboard com estatísticas
6. Aplicar estética blueprint
