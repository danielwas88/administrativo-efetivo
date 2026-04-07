# Project TODO - Gestão de Efetivo PM

## Banco de Dados
- [x] Atualizar schema.ts com todas as tabelas necessárias
- [x] Gerar migrations SQL com Drizzle Kit
- [x] Aplicar migrations ao banco de dados

## Autenticação e Controle de Acesso
- [x] Implementar roles (admin, gestor, visualizador)
- [x] Criar adminProcedure e gestorProcedure
- [x] Configurar proteção de rotas baseada em roles
- [x] Testes de autenticação

## CRUD de Militares
- [x] Criar procedure para listar militares com paginação
- [x] Criar procedure para buscar militar por ID
- [x] Criar procedure para criar novo militar
- [x] Criar procedure para atualizar militar
- [x] Criar procedure para deletar militar
- [x] Implementar busca e filtros avançados
- [x] Criar componente de tabela de militares
- [x] Criar formulário de cadastro/edição
- [x] Criar modal de confirmação de exclusão
- [x] Testes unitários do CRUD

## Dashboard
- [x] Criar procedures para estatísticas
- [x] Implementar gráfico de total de militares
- [ ] Implementar gráfico de distribuição por posto/graduação
- [ ] Implementar gráfico de distribuição por esqd/seç
- [ ] Implementar gráfico de distribuição por tipo de afastamento
- [ ] Implementar gráfico de distribuição por categoria
- [x] Implementar alertas de documentos vencidos
- [x] Criar componente de dashboard
- [ ] Testes de dashboard

## Exportação de Dados
- [x] Implementar exportação para Excel (XLSX)
- [x] Implementar exportação para CSV
- [ ] Implementar exportação para PDF
- [x] Criar UI para seleção de formato
- [x] Testes de exportação

## Importação de Dados
- [ ] Implementar importação de Excel (XLSX)
- [ ] Implementar importação de CSV
- [ ] Validar dados durante importação
- [ ] Criar UI para upload de arquivo
- [ ] Testes de importação

## Gestão de Afastamentos
- [x] Atualizar schema para tabelas de afastamentos
- [x] Gerar e aplicar migrations SQL
- [x] Criar procedures tRPC para CRUD de afastamentos
- [x] Implementar validações de datas e conflitos
- [x] Criar página de gestão de afastamentos
- [x] Implementar formulário de novo afastamento
- [x] Criar tabela com listagem de afastamentos
- [x] Implementar filtros por militar, tipo e data
- [ ] Criar modal de edição de afastamento
- [x] Implementar exclusão com confirmação
- [ ] Adicionar histórico de afastamentos
- [x] Testes de afastamentos

## Histórico de Ações (Auditoria)
- [ ] Implementar registro de criação de militar
- [ ] Implementar registro de edição de militar
- [ ] Implementar registro de exclusão de militar
- [ ] Criar visualização de histórico
- [ ] Testes de auditoria

## Alertas Automáticos
- [ ] Implementar verificação de CNH vencida
- [ ] Implementar verificação de identidade militar vencida
- [ ] Implementar verificação de bienal vencida
- [ ] Criar sistema de notificações
- [ ] Testes de alertas

## Interface e Estética Blueprint
- [x] Configurar paleta de cores (azul royal profundo)
- [x] Implementar grid técnico sutil
- [x] Criar componentes com linhas brancas/azuis
- [x] Implementar tipografia sans-serif branca
- [x] Criar marcadores de dimensão e frames
- [x] Aplicar estética CAD em toda a interface
- [ ] Testes de responsividade

## Análises com LLM
- [ ] Implementar análise de padrões de afastamento
- [ ] Implementar sugestões de otimização de escala
- [ ] Implementar previsão de necessidades de pessoal
- [ ] Criar UI para exibir análises
- [ ] Testes de LLM

## Testes e Validação
- [ ] Testes unitários do backend
- [ ] Testes de integração
- [ ] Testes de UI
- [ ] Testes de performance
- [ ] Testes de segurança

## Publicação
- [ ] Criar checkpoint final
- [ ] Publicar no servidor
- [ ] Validar funcionamento em produção

## Correções e Melhorias
- [x] Corrigir validação de enums no formulário de cadastro de militares
- [x] Converter mesFeria e mesAbono de string para número
- [x] Garantir valores padrão para datas obrigatórias

## Campos Opcionais
- [x] Remover validação obrigatória de todos os campos do formulário
- [x] Atualizar schema para aceitar NULL em campos que eram obrigatórios
- [x] Testar cadastro com apenas alguns campos preenchidos

## Validade Identidade Militar
- [x] Adicionar opção "Indeterminada" no campo de Validade Identidade Militar
- [x] Armazenar "indeterminada" como valor especial no banco de dados
- [x] Exibir "Indeterminada" na tabela de militares

## Importação em Massa
- [x] Criar página de Importação de Dados
- [x] Implementar upload de arquivo Excel (XLSX)
- [x] Implementar upload de arquivo CSV
- [x] Parsear dados do Excel/CSV
- [x] Validar dados importados
- [x] Inserir dados no banco de dados
- [x] Mostrar resumo de importação (sucesso/erro)
- [x] Permitir revisão antes de confirmar importação
- [x] Testes de importação


## Formato de Datas
- [x] Alterar todos os formatos de YYYY-MM-DD para DD-MM-YYYY em formulários
- [x] Alterar exibição de datas em tabelas para DD-MM-YYYY
- [x] Alterar exportação de datas em Excel/CSV para DD-MM-YYYY
- [x] Alterar parsing de importação para aceitar DD-MM-YYYY
- [x] Criar utilitários de conversão de datas
- [x] Criar testes para funções de formatação de datas


## Ordenação por Antiguidade
- [x] Adicionar coluna `sequencia` na tabela de militares
- [x] Gerar e aplicar migration SQL para nova coluna
- [x] Atualizar schema.ts com campo sequencia
- [x] Criar procedure tRPC para reordenar militares
- [x] Implementar UI de reordenação com botões de seta
- [x] Atualizar listagem para ordenar por sequencia
- [x] Criar testes para reordenação
- [x] Validar integridade de sequências
