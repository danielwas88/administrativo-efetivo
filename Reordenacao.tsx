import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, ChevronUp, ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";

interface Militar {
  id: number;
  nomeGuerra: string;
  nome: string;
  postGrad: string;
  sequencia: number;
}

export default function Reordenacao() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const reordenarMutation = trpc.militares.reordenar.useMutation();
  const porSequenciaQuery = trpc.militares.porSequencia.useQuery({
    limit: 1000,
    offset: 0,
  });

  useEffect(() => {
    if (porSequenciaQuery.data) {
      setMilitares(porSequenciaQuery.data as any);
      setIsLoading(false);
    }
  }, [porSequenciaQuery.data]);

  if (!user || (user.role !== "admin" && user.role !== "gestor")) {
    return (
      <div className="min-h-screen bg-[#001a4d] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">Acesso negado</p>
          <p className="text-gray-400">Apenas gestores e administradores podem reordenar militares</p>
        </div>
      </div>
    );
  }

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newMilitares = [...militares];
    const temp = newMilitares[index];
    newMilitares[index] = newMilitares[index - 1];
    newMilitares[index - 1] = temp;
    setMilitares(newMilitares);
    setHasChanges(true);
  };

  const moveDown = (index: number) => {
    if (index === militares.length - 1) return;
    const newMilitares = [...militares];
    const temp = newMilitares[index];
    newMilitares[index] = newMilitares[index + 1];
    newMilitares[index + 1] = temp;
    setMilitares(newMilitares);
    setHasChanges(true);
  };

  const salvarReordenacao = async () => {
    setIsSaving(true);
    try {
      const novaSequencia = militares.map((m, index) => ({
        id: m.id,
        sequencia: index + 1,
      }));

      await reordenarMutation.mutateAsync({ sequencia: novaSequencia });
      toast.success("Reordenação salva com sucesso!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Erro ao salvar reordenação");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#001a4d] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001a4d] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/militares")}
              className="p-2 hover:bg-blue-900/50 rounded border border-blue-500/50"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Reordenação de Militares</h1>
              <p className="text-gray-400">Organize os militares por antiguidade</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500 rounded p-4 mb-6">
          <p className="text-sm text-gray-300">
            Use os botões de seta para mover militares para cima ou para baixo. A sequência será salva automaticamente.
          </p>
        </div>

        {/* Tabela de Reordenação */}
        <div className="bg-blue-900/10 border border-blue-500 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-500/50 bg-blue-900/30">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-300">Seq</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-300">Nome de Guerra</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-300">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-300">Posto/Grad</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {militares.map((militar, index) => (
                  <tr
                    key={militar.id}
                    className="border-b border-blue-500/30 hover:bg-blue-900/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-blue-400">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-white">{militar.nomeGuerra}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{militar.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{militar.postGrad}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-blue-500/50"
                          title="Mover para cima"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === militares.length - 1}
                          className="p-1 hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-blue-500/50"
                          title="Mover para baixo"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={salvarReordenacao}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-blue-400 text-white font-semibold transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Reordenação
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
