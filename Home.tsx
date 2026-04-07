import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Users, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  // Fetch dashboard stats
  const efetivoCounts = trpc.dashboard.efetivoCounts.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const documentosVencidos = trpc.dashboard.documentosVencidos.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001a4d]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#1e90ff]" />
          <p className="text-white text-lg">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001a4d]">
        <div className="blueprint-container p-12 max-w-md w-full">
          <div className="blueprint-header mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Gestão de Efetivo PM</h1>
            <p className="text-gray-300">Sistema de Gerenciamento de Policiais Militares</p>
          </div>
          <div className="blueprint-divider"></div>
          <p className="text-gray-300 mb-8 text-center">Faça login para acessar o sistema de gestão de efetivo policial militar com análises avançadas e controle total.</p>
          <a href={getLoginUrl()}>
            <Button className="blueprint-btn w-full">Fazer Login</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001a4d]">
      {/* Header */}
      <div className="blueprint-header">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gestão de Efetivo PM</h1>
            <p className="text-gray-300">Bem-vindo, {user?.name || 'Usuário'}</p>
          </div>
          <button
            onClick={() => logout()}
            className="blueprint-btn"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Militares */}
          <div className="blueprint-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Total de Militares</p>
                <p className="text-3xl font-bold text-white">
                  {efetivoCounts.data?.total || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-[#1e90ff] opacity-50" />
            </div>
          </div>

          {/* Ativos */}
          <div className="blueprint-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Militares Ativos</p>
                <p className="text-3xl font-bold text-[#1e90ff]">
                  {efetivoCounts.data?.ativos || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-[#1e90ff] opacity-50" />
            </div>
          </div>

          {/* Inativos */}
          <div className="blueprint-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Militares Inativos</p>
                <p className="text-3xl font-bold text-gray-400">
                  {efetivoCounts.data?.inativos || 0}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-gray-500 opacity-50" />
            </div>
          </div>

          {/* Documentos Vencidos */}
          <div className="blueprint-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm mb-2">Documentos Vencidos</p>
                <p className="text-3xl font-bold text-red-400">
                  {documentosVencidos.data?.length || 0}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {documentosVencidos.data && documentosVencidos.data.length > 0 && (
          <div className="blueprint-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Alertas de Documentos Vencidos
            </h2>
            <div className="blueprint-divider"></div>
            <div className="space-y-3">
              {documentosVencidos.data.slice(0, 5).map((doc: any) => (
                <div key={doc.id} className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                  <p className="text-white font-semibold">{doc.nomeGuerra} - {doc.nome}</p>
                  <p className="text-gray-300 text-sm">Documentos vencidos precisam de renovação</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="blueprint-card">
          <h2 className="text-2xl font-bold text-white mb-4">Ações Rápidas</h2>
          <div className="blueprint-divider"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/militares" className="blueprint-btn block text-center">
              Gerenciar Militares
            </a>
            <a href="/importacao" className="blueprint-btn block text-center">
              Importar Dados
            </a>
            <a href="/afastamentos" className="blueprint-btn block text-center">
              Afastamentos
            </a>
            <a href="/reordenacao" className="blueprint-btn block text-center">
              Reordenar Militares
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
