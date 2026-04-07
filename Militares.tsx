import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Plus, Edit2, Trash2, Download } from "lucide-react";
import { useLocation } from "wouter";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import { formatDateBR } from "@/lib/dateUtils";
export default function Militares() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(0);
  const [searchNome, setSearchNome] = useState("");
  const [searchMatricula, setSearchMatricula] = useState("");
  const [filterPostGrad, setFilterPostGrad] = useState("");
  const [filterEsqdSec, setFilterEsqdSec] = useState("");
  const [filterAtivo, setFilterAtivo] = useState<boolean | undefined>();

  const { data, isLoading } = trpc.militares.list.useQuery(
    {
      limit: 50,
      offset: page * 50,
      nome: searchNome || undefined,
      matricula: searchMatricula || undefined,
      postGrad: filterPostGrad || undefined,
      esqd_sec: filterEsqdSec || undefined,
      ativo: filterAtivo,
    },
    { enabled: !!user }
  );

  const deleteMutation = trpc.militares.delete.useMutation({
    onSuccess: () => {
      setPage(0);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este militar?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-[#001a4d]">
      <div className="blueprint-header">
        <div className="container flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Gerenciar Militares</h1>
          <div className="flex gap-2">
            {data?.data && data.data.length > 0 && (
              <>
                <button
                  onClick={() => exportToExcel(data.data as any)}
                  className="blueprint-btn flex items-center gap-2"
                  title="Exportar para Excel"
                >
                  <Download className="w-5 h-5" />
                  Excel
                </button>
                <button
                  onClick={() => exportToCSV(data.data as any)}
                  className="blueprint-btn flex items-center gap-2"
                  title="Exportar para CSV"
                >
                  <Download className="w-5 h-5" />
                  CSV
                </button>
              </>
            )}
            <button
              onClick={() => setLocation("/militares/novo")}
              className="blueprint-btn flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Militar
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="blueprint-card mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Filtros de Busca</h2>
          <div className="blueprint-divider mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Nome</label>
              <input
                type="text"
                value={searchNome}
                onChange={(e) => {
                  setSearchNome(e.target.value);
                  setPage(0);
                }}
                placeholder="Buscar por nome..."
                className="blueprint-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Matrícula</label>
              <input
                type="text"
                value={searchMatricula}
                onChange={(e) => {
                  setSearchMatricula(e.target.value);
                  setPage(0);
                }}
                placeholder="Buscar por matrícula..."
                className="blueprint-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Posto/Grad</label>
              <input
                type="text"
                value={filterPostGrad}
                onChange={(e) => {
                  setFilterPostGrad(e.target.value);
                  setPage(0);
                }}
                placeholder="Ex: Tenente..."
                className="blueprint-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Esqd/Seç</label>
              <input
                type="text"
                value={filterEsqdSec}
                onChange={(e) => {
                  setFilterEsqdSec(e.target.value);
                  setPage(0);
                }}
                placeholder="Ex: 1º BPM..."
                className="blueprint-input"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Status</label>
              <select
                value={filterAtivo === undefined ? "" : filterAtivo ? "ativo" : "inativo"}
                onChange={(e) => {
                  if (e.target.value === "") setFilterAtivo(undefined);
                  else setFilterAtivo(e.target.value === "ativo");
                  setPage(0);
                }}
                className="blueprint-input"
              >
                <option value="">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="blueprint-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1e90ff]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="blueprint-table">
                  <thead>
                    <tr>
                      <th>Nome de Guerra</th>
                      <th>Nome Completo</th>
                      <th>Matrícula</th>
                      <th>Posto/Grad</th>
                      <th>Esqd/Seç</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((militar: any) => (
                        <tr key={militar.id}>
                          <td className="font-semibold">{militar.nomeGuerra}</td>
                          <td>{militar.nome}</td>
                          <td>{militar.matricula}</td>
                          <td>{militar.postGrad}</td>
                          <td>{militar.esqd_sec}</td>
                          <td>
                            <span
                              className={`px-3 py-1 rounded text-sm font-semibold ${
                                militar.ativo
                                  ? "bg-green-900/30 text-green-300"
                                  : "bg-red-900/30 text-red-300"
                              }`}
                            >
                              {militar.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setLocation(`/militares/${militar.id}/editar`)}
                                className="p-2 hover:bg-blue-900/30 rounded transition"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4 text-[#1e90ff]" />
                              </button>
                              {user?.role === "admin" && (
                                <button
                                  onClick={() => handleDelete(militar.id)}
                                  disabled={deleteMutation.isPending}
                                  className="p-2 hover:bg-red-900/30 rounded transition disabled:opacity-50"
                                  title="Deletar"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          Nenhum militar encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="blueprint-divider mt-6 mb-4"></div>
              <div className="flex items-center justify-between">
                <p className="text-gray-300">
                  Total: <span className="font-bold text-white">{data?.total || 0}</span> militares
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="blueprint-btn disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-3 text-white">
                    Página {page + 1} de {Math.ceil((data?.total || 0) / 50)}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!data || page >= Math.ceil(data.total / 50) - 1}
                    className="blueprint-btn disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
