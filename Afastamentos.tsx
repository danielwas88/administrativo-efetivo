import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatDateBR, toInputFormat } from "@/lib/dateUtils";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Calendar } from "lucide-react";

export default function Afastamentos() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [filtroMilitar, setFiltroMilitar] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    militarId: "",
    tipoAfastamentoId: "",
    dataInicio: "",
    dataFim: "",
    motivo: "",
    observacoes: "",
  });

  const afastamentosQuery = trpc.afastamentos.list.useQuery(
    {
      militarId: filtroMilitar ? parseInt(filtroMilitar) : undefined,
      status: filtroStatus || undefined,
    },
    { enabled: !!user }
  );

  const militaresQuery = trpc.militares.list.useQuery({ limit: 1000 }, { enabled: !!user });
  const tiposQuery = trpc.tiposAfastamento.list.useQuery(undefined, { enabled: !!user });

  const createMutation = trpc.afastamentos.create.useMutation();
  const deleteMutation = trpc.afastamentos.delete.useMutation();

  const handleCreateAfastamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.militarId || !formData.tipoAfastamentoId || !formData.dataInicio || !formData.dataFim) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        militarId: parseInt(formData.militarId),
        tipoAfastamentoId: parseInt(formData.tipoAfastamentoId),
        dataInicio: new Date(formData.dataInicio),
        dataFim: new Date(formData.dataFim),
        motivo: formData.motivo || undefined,
        observacoes: formData.observacoes || undefined,
      });
      toast.success("Afastamento criado com sucesso!");
      setFormData({
        militarId: "",
        tipoAfastamentoId: "",
        dataInicio: "",
        dataFim: "",
        motivo: "",
        observacoes: "",
      });
      setShowForm(false);
      afastamentosQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar afastamento");
    }
  };

  const handleDeleteAfastamento = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Afastamento deletado com sucesso!");
      afastamentosQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar afastamento");
    }
  };

  const getMilitarNome = (id: number) => {
    const militar = militaresQuery.data?.data?.find((m: any) => m.id === id);
    return militar ? `${militar.nomeGuerra} - ${militar.nome}` : "Desconhecido";
  };

  const getTipoNome = (id: number) => {
    const tipo = tiposQuery.data?.find((t: any) => t.id === id);
    return tipo?.nome || "Desconhecido";
  };

  return (
    <div className="min-h-screen bg-[#001a4d] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[#1e90ff]" />
            Gestão de Afastamentos
          </h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1e90ff] hover:bg-[#0d6bb8] text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Afastamento
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="bg-[#001a4d] border-[#1e90ff] border-2 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#1e90ff]"></div>
              Novo Afastamento
            </h2>
            <form onSubmit={handleCreateAfastamento} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="militarId" className="text-gray-300">Militar *</Label>
                  <Select value={formData.militarId} onValueChange={(value) => setFormData({ ...formData, militarId: value })}>
                    <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                      <SelectValue placeholder="Selecione um militar..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                      {militaresQuery.data?.data?.map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.nomeGuerra} - {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipoAfastamentoId" className="text-gray-300">Tipo de Afastamento *</Label>
                  <Select value={formData.tipoAfastamentoId} onValueChange={(value) => setFormData({ ...formData, tipoAfastamentoId: value })}>
                    <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                      {tiposQuery.data?.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dataInicio" className="text-gray-300">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim" className="text-gray-300">Data de Término *</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="motivo" className="text-gray-300">Motivo</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-[#1e90ff] hover:bg-[#0d6bb8] text-white"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-[#1e90ff] text-[#1e90ff] hover:bg-[#1e90ff] hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filtros */}
        <Card className="bg-[#001a4d] border-[#1e90ff] border-2 p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtroMilitar" className="text-gray-300">Militar</Label>
              <Select value={filtroMilitar} onValueChange={setFiltroMilitar}>
                <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                  <SelectItem value="">Todos</SelectItem>
                  {militaresQuery.data?.data?.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nomeGuerra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroStatus" className="text-gray-300">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabela */}
        <Card className="bg-[#001a4d] border-[#1e90ff] border-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0a2a5a] border-b-2 border-[#1e90ff]">
                  <th className="px-6 py-4 text-left text-white font-bold">Militar</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Tipo</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Início</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Término</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Status</th>
                  <th className="px-6 py-4 text-left text-white font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {afastamentosQuery.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      Carregando...
                    </td>
                  </tr>
                ) : afastamentosQuery.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      Nenhum afastamento encontrado
                    </td>
                  </tr>
                ) : (
                  afastamentosQuery.data?.map((afastamento: any) => (
                    <tr key={afastamento.id} className="border-b border-[#0a2a5a] hover:bg-[#0a2a5a] transition">
                      <td className="px-6 py-4 text-gray-200">{getMilitarNome(afastamento.militarId)}</td>
                      <td className="px-6 py-4 text-gray-200">{getTipoNome(afastamento.tipoAfastamentoId)}</td>
                      <td className="px-6 py-4 text-gray-200">
                        {formatDateBR(afastamento.dataInicio)}
                      </td>
                      <td className="px-6 py-4 text-gray-200">
                        {formatDateBR(afastamento.dataFim)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-sm font-bold ${
                          afastamento.status === "aprovado" ? "bg-green-900 text-green-200" :
                          afastamento.status === "pendente" ? "bg-yellow-900 text-yellow-200" :
                          afastamento.status === "rejeitado" ? "bg-red-900 text-red-200" :
                          "bg-gray-900 text-gray-200"
                        }`}>
                          {afastamento.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#1e90ff] text-[#1e90ff] hover:bg-[#1e90ff] hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar este afastamento?
                              </AlertDialogDescription>
                              <div className="flex gap-2 justify-end">
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAfastamento(afastamento.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
