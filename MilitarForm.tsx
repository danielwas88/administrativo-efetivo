import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toInputFormat, fromInputFormat } from "@/lib/dateUtils";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";

interface FormData {
  nomeGuerra: string | null;
  nome: string | null;
  matricula: string | null;
  postGrad: string | null;
  cpf: string | null;
  dataNascimento: string | null;
  dataInclusao: string | null;
  funcao: string | null;
  regimeEscala: string | null;
  esqd_sec: string | null;
  mesFeria: number | null;
  mesAbono: number | null;
  cidadeResidencia: string | null;
  email: string | null;
  telefone: string | null;
  genero: string | null;
  dataAdmissao: string | null;
  ativo: boolean;
  porteArma: string | null;
  validadeBienal: string | null;
  validadeIdentidadeMilitar: string | null;
  validadeCnh: string | null;
  categoria: string | null;
  observacoes: string | null;
}

export default function MilitarForm({ id }: { id?: string }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    nomeGuerra: null,
    nome: null,
    matricula: null,
    postGrad: null,
    cpf: null,
    dataNascimento: null,
    dataInclusao: null,
    funcao: null,
    regimeEscala: null,
    esqd_sec: null,
    mesFeria: null,
    mesAbono: null,
    cidadeResidencia: null,
    email: null,
    telefone: null,
    genero: null,
    dataAdmissao: null,
    ativo: true,
    porteArma: null,
    validadeBienal: null,
    validadeIdentidadeMilitar: null,
    validadeCnh: null,
    categoria: null,
    observacoes: null,
  });

  const getMilitar = trpc.militares.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );
  const militar = getMilitar.data;

  const createMutation = trpc.militares.create.useMutation();
  const updateMutation = trpc.militares.update.useMutation();
  const deleteMutation = trpc.militares.delete.useMutation();

  useEffect(() => {
    if (militar) {
      setFormData({
        ...militar,
        mesFeria: militar.mesFeria || null,
        mesAbono: militar.mesAbono || null,
        validadeBienal: militar.validadeBienal ? new Date(militar.validadeBienal).toISOString().split("T")[0] : null,
        validadeIdentidadeMilitar: typeof militar.validadeIdentidadeMilitar === "string" ? militar.validadeIdentidadeMilitar : (militar.validadeIdentidadeMilitar ? new Date(militar.validadeIdentidadeMilitar).toISOString().split("T")[0] : null),
        validadeCnh: militar.validadeCnh ? new Date(militar.validadeCnh).toISOString().split("T")[0] : null,
        dataNascimento: militar.dataNascimento ? new Date(militar.dataNascimento).toISOString().split("T")[0] : null,
        dataInclusao: new Date(militar.dataInclusao).toISOString().split("T")[0],
        dataAdmissao: militar.dataAdmissao ? new Date(militar.dataAdmissao).toISOString().split("T")[0] : null,
      } as any);
    }
  }, [militar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const convertEnumValue = (value: string, validValues: string[]): string | null => {
    return validValues.includes(value) ? value : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nomeGuerra: formData.nomeGuerra || undefined,
      nome: formData.nome || undefined,
      matricula: formData.matricula || undefined,
      postGrad: formData.postGrad || undefined,
      cpf: formData.cpf || undefined,
      dataNascimento: formData.dataNascimento ? new Date(formData.dataNascimento) : undefined,
      dataInclusao: formData.dataInclusao ? new Date(formData.dataInclusao) : new Date(),
      funcao: formData.funcao || undefined,
      regimeEscala: formData.regimeEscala ? convertEnumValue(formData.regimeEscala, ["08x40", "12x36", "12x60", "24x72", "expediente"]) : undefined,
      esqd_sec: formData.esqd_sec || undefined,
      mesFeria: formData.mesFeria ? parseInt(formData.mesFeria.toString()) : undefined,
      mesAbono: formData.mesAbono ? parseInt(formData.mesAbono.toString()) : undefined,
      cidadeResidencia: formData.cidadeResidencia || undefined,
      email: formData.email || undefined,
      telefone: formData.telefone || undefined,
      genero: formData.genero ? convertEnumValue(formData.genero, ["masculino", "feminino", "outro"]) : undefined,
      dataAdmissao: formData.dataAdmissao ? new Date(formData.dataAdmissao) : undefined,
      ativo: formData.ativo,
      porteArma: formData.porteArma ? convertEnumValue(formData.porteArma, ["ativo", "suspenso"]) : undefined,
      validadeBienal: formData.validadeBienal ? new Date(formData.validadeBienal) : undefined,
      validadeIdentidadeMilitar: formData.validadeIdentidadeMilitar === "indeterminada" ? "indeterminada" : (formData.validadeIdentidadeMilitar ? formData.validadeIdentidadeMilitar : undefined),
      validadeCnh: formData.validadeCnh ? new Date(formData.validadeCnh) : undefined,
      categoria: formData.categoria ? convertEnumValue(formData.categoria, ["operacional", "apoio_operacional", "dhpm", "administrativo", "inteligencia"]) : undefined,
      observacoes: formData.observacoes || undefined,
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({
          id: parseInt(id),
          data: payload as any,
        });
        toast.success("Militar atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Militar cadastrado com sucesso!");
      }
      setLocation("/militares");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar militar");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync({ id: parseInt(id) });
      toast.success("Militar deletado com sucesso!");
      setLocation("/militares");
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar militar");
    }
  };

  return (
    <div className="min-h-screen bg-[#001a4d] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/militares")} className="text-[#1e90ff] hover:text-white transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">{id ? "Editar Militar" : "Novo Militar"}</h1>
          </div>
          {id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja deletar este militar? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Deletar
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Form */}
        <Card className="bg-[#001a4d] border-[#1e90ff] border-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção Pessoal */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#1e90ff]"></div>
                Informações Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeGuerra" className="text-gray-300">Nome de Guerra</Label>
                  <Input
                    id="nomeGuerra"
                    name="nomeGuerra"
                    value={formData.nomeGuerra || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="nome" className="text-gray-300">Nome Completo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf" className="text-gray-300">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="dataNascimento" className="text-gray-300">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="genero" className="text-gray-300">Gênero</Label>
                  <Select value={formData.genero || ""} onValueChange={(value) => setFormData({ ...formData, genero: value })}>
                    <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Seção Militar */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#1e90ff]"></div>
                Informações Militares
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="matricula" className="text-gray-300">Matrícula</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    value={formData.matricula || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="postGrad" className="text-gray-300">Posto/Graduação</Label>
                  <Input
                    id="postGrad"
                    name="postGrad"
                    value={formData.postGrad || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="funcao" className="text-gray-300">Função</Label>
                  <Input
                    id="funcao"
                    name="funcao"
                    value={formData.funcao || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria" className="text-gray-300">Categoria</Label>
                  <Select value={formData.categoria || ""} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="apoio_operacional">Apoio Operacional</SelectItem>
                      <SelectItem value="dhpm">DHPM</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="inteligencia">Inteligência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="regimeEscala" className="text-gray-300">Regime de Escala</Label>
                  <Select value={formData.regimeEscala || ""} onValueChange={(value) => setFormData({ ...formData, regimeEscala: value })}>
                    <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                      <SelectItem value="08x40">08x40</SelectItem>
                      <SelectItem value="12x36">12x36</SelectItem>
                      <SelectItem value="12x60">12x60</SelectItem>
                      <SelectItem value="24x72">24x72</SelectItem>
                      <SelectItem value="expediente">Expediente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="esqd_sec" className="text-gray-300">Esqd/Seção</Label>
                  <Input
                    id="esqd_sec"
                    name="esqd_sec"
                    value={formData.esqd_sec || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="dataInclusao" className="text-gray-300">Data de Inclusão</Label>
                  <Input
                    id="dataInclusao"
                    name="dataInclusao"
                    type="date"
                    value={formData.dataInclusao || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="dataAdmissao" className="text-gray-300">Data de Admissão</Label>
                  <Input
                    id="dataAdmissao"
                    name="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="mesFeria" className="text-gray-300">Mês de Férias</Label>
                  <Input
                    id="mesFeria"
                    name="mesFeria"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.mesFeria || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="mesAbono" className="text-gray-300">Mês de Abono</Label>
                  <Input
                    id="mesAbono"
                    name="mesAbono"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.mesAbono || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
              </div>
            </div>

            {/* Seção Documentos */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#1e90ff]"></div>
                Documentos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validadeBienal" className="text-gray-300">Validade Bienal</Label>
                  <Input
                    id="validadeBienal"
                    name="validadeBienal"
                    type="date"
                    value={formData.validadeBienal || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="validadeIdentidadeMilitar" className="text-gray-300">Validade Identidade Militar</Label>
                  <Select value={formData.validadeIdentidadeMilitar || ""} onValueChange={(value) => setFormData({ ...formData, validadeIdentidadeMilitar: value })}>
                    <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                      <SelectItem value="indeterminada">Indeterminada</SelectItem>
                      <SelectItem value="data">Especificar Data</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
                <div>
                  <Label htmlFor="validadeCnh" className="text-gray-300">Validade CNH</Label>
                  <Input
                    id="validadeCnh"
                    name="validadeCnh"
                    type="date"
                    value={formData.validadeCnh || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="porteArma" className="text-gray-300">Porte de Arma</Label>
                  <Select value={formData.porteArma || ""} onValueChange={(value) => setFormData({ ...formData, porteArma: value })}>
                    <SelectTrigger className="bg-[#0a2a5a] border-[#1e90ff] text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a2a5a] border-[#1e90ff]">
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Seção Contato */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#1e90ff]"></div>
                Contato
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone" className="text-gray-300">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cidadeResidencia" className="text-gray-300">Cidade de Residência</Label>
                  <Input
                    id="cidadeResidencia"
                    name="cidadeResidencia"
                    value={formData.cidadeResidencia || ""}
                    onChange={handleChange}
                    className="bg-[#0a2a5a] border-[#1e90ff] text-white"
                  />
                </div>
              </div>
            </div>

            {/* Seção Observações */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#1e90ff]"></div>
                Observações
              </h2>
              <Textarea
                name="observacoes"
                value={formData.observacoes || ""}
                onChange={handleChange}
                placeholder="Adicione observações sobre este militar..."
                className="bg-[#0a2a5a] border-[#1e90ff] text-white min-h-24"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Militar Ativo</span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/militares")}
                className="border-[#1e90ff] text-[#1e90ff] hover:bg-[#1e90ff] hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#1e90ff] hover:bg-[#0d6bb8] text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
