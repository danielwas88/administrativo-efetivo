import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, Upload, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { formatDateBR, parseDateBR } from "@/lib/dateUtils";

interface MilitarImportacao {
  nomeGuerra?: string;
  nome?: string;
  matricula?: string;
  postGrad?: string;
  cpf?: string;
  dataNascimento?: string;
  dataInclusao?: string;
  funcao?: string;
  regimeEscala?: string;
  esqd_sec?: string;
  mesFeria?: string;
  mesAbono?: string;
  cidadeResidencia?: string;
  email?: string;
  telefone?: string;
  genero?: string;
  dataAdmissao?: string;
  ativo?: string;
  porteArma?: string;
  validadeBienal?: string;
  validadeIdentidadeMilitar?: string;
  validadeCnh?: string;
  categoria?: string;
  observacoes?: string;
}

interface ResultadoImportacao {
  total: number;
  sucesso: number;
  erro: number;
  erros: { linha: number; mensagem: string }[];
}

export default function Importacao() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [dados, setDados] = useState<MilitarImportacao[]>([]);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [preview, setPreview] = useState(false);

  const importarMutation = trpc.militares.importarEmMassa.useMutation({
    onSuccess: (result: any) => {
      setResultado(result);
      toast.success(`Importação concluída: ${result.sucesso} militares cadastrados`);
    },
    onError: (error: any) => {
      toast.error(`Erro na importação: ${error.message}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let parsedData: MilitarImportacao[] = [];

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // Parse Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        parsedData = jsonData as MilitarImportacao[];
        setDados(parsedData);
        setPreview(true);
        setIsLoading(false);
        return;
      } else if (file.name.endsWith(".csv")) {
        // Parse CSV
        return new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              parsedData = results.data as MilitarImportacao[];
              setDados(parsedData);
              setPreview(true);
              setIsLoading(false);
              resolve(null);
            },
            error: (error) => {
              toast.error(`Erro ao ler CSV: ${error.message}`);
              setIsLoading(false);
              resolve(null);
            },
          });
        });
      } else {
        toast.error("Formato de arquivo não suportado. Use Excel (.xlsx) ou CSV (.csv)");
        setIsLoading(false);
        return;
      }

      setDados(parsedData);
      setPreview(true);
    } catch (error: any) {
      toast.error(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportar = async () => {
    if (dados.length === 0) {
      toast.error("Nenhum dado para importar");
      return;
    }

    setIsLoading(true);
    try {
      // Converter dados para o formato esperado
      const militaresParaImportar = dados.map((d) => {
        // Função auxiliar para parsear datas em DD-MM-YYYY ou YYYY-MM-DD
        const parseDate = (dateStr: string | undefined): Date | null => {
          if (!dateStr) return null;
          // Tenta parsear como DD-MM-YYYY primeiro
          const brDate = parseDateBR(dateStr);
          if (brDate) return brDate;
          // Se falhar, tenta como YYYY-MM-DD
          const isoDate = new Date(dateStr);
          return !isNaN(isoDate.getTime()) ? isoDate : null;
        };

        return {
          nomeGuerra: d.nomeGuerra || null,
          nome: d.nome || null,
          matricula: d.matricula || null,
          postGrad: d.postGrad || null,
          cpf: d.cpf || null,
          dataNascimento: parseDate(d.dataNascimento),
          dataInclusao: parseDate(d.dataInclusao) || new Date(),
          funcao: d.funcao || null,
          regimeEscala: d.regimeEscala || null,
          esqd_sec: d.esqd_sec || null,
          mesFeria: d.mesFeria ? parseInt(d.mesFeria) : null,
          mesAbono: d.mesAbono ? parseInt(d.mesAbono) : null,
          cidadeResidencia: d.cidadeResidencia || null,
          email: d.email || null,
          telefone: d.telefone || null,
          genero: d.genero || null,
          dataAdmissao: parseDate(d.dataAdmissao) || new Date(),
          ativo: d.ativo ? d.ativo.toLowerCase() === "sim" || d.ativo === "true" : true,
          porteArma: d.porteArma || null,
          validadeBienal: parseDate(d.validadeBienal),
          validadeIdentidadeMilitar: d.validadeIdentidadeMilitar === "indeterminada" ? "indeterminada" : parseDate(d.validadeIdentidadeMilitar),
          validadeCnh: parseDate(d.validadeCnh),
          categoria: d.categoria || null,
          observacoes: d.observacoes || null,
        };
      });

      importarMutation.mutate(militaresParaImportar as any);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001a4d]">
      <div className="blueprint-header">
        <div className="container flex items-center gap-4">
          <button
            onClick={() => setLocation("/militares")}
            className="p-2 hover:bg-blue-900/30 rounded transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">Importação em Massa</h1>
        </div>
      </div>

      <div className="container py-6">
        {!preview && !resultado && (
          <div className="blueprint-card max-w-2xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Selecionar Arquivo</h2>
                <div className="blueprint-divider mb-4"></div>
                <p className="text-gray-300 mb-4">
                  Selecione um arquivo Excel (.xlsx) ou CSV (.csv) com os dados dos militares.
                </p>
                <div className="border-2 border-dashed border-blue-500 rounded-lg p-8 text-center hover:bg-blue-900/10 transition cursor-pointer">
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-white font-semibold mb-2">Clique para selecionar arquivo</p>
                    <p className="text-gray-400 text-sm">ou arraste um arquivo aqui</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Formato Esperado</h3>
                <div className="blueprint-divider mb-4"></div>
                <div className="bg-blue-900/20 border border-blue-500 rounded p-4 text-gray-300 text-sm">
                  <p className="mb-2">O arquivo deve conter as seguintes colunas (opcionais):</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>nomeGuerra, nome, matricula, postGrad, cpf</li>
                    <li>dataNascimento, dataInclusao, dataAdmissao (formato: DD-MM-YYYY ou YYYY-MM-DD)</li>
                    <li>funcao, regimeEscala, esqd_sec</li>
                    <li>mesFeria, mesAbono (1-12), genero (masculino/feminino/outro)</li>
                    <li>email, telefone, cidadeResidencia</li>
                    <li>ativo (sim/não ou true/false)</li>
                    <li>porteArma (ativo/suspenso)</li>
                    <li>validadeBienal, validadeIdentidadeMilitar, validadeCnh (YYYY-MM-DD ou "indeterminada")</li>
                    <li>categoria (operacional/apoio_operacional/dhpm/administrativo/inteligencia)</li>
                    <li>observacoes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {preview && !resultado && (
          <div className="blueprint-card max-w-4xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Preview dos Dados</h2>
                <div className="blueprint-divider mb-4"></div>
                <p className="text-gray-300 mb-4">
                  Total de registros: <span className="text-blue-400 font-bold">{dados.length}</span>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead>
                    <tr className="border-b border-blue-500">
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Matrícula</th>
                      <th className="px-4 py-2 text-left">CPF</th>
                      <th className="px-4 py-2 text-left">Posto</th>
                      <th className="px-4 py-2 text-left">Esqd/Seção</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.slice(0, 10).map((d, i) => (
                      <tr key={i} className="border-b border-blue-900/30">
                        <td className="px-4 py-2">{d.nome || "-"}</td>
                        <td className="px-4 py-2">{d.matricula || "-"}</td>
                        <td className="px-4 py-2">{d.cpf || "-"}</td>
                        <td className="px-4 py-2">{d.postGrad || "-"}</td>
                        <td className="px-4 py-2">{d.esqd_sec || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dados.length > 10 && (
                  <p className="text-gray-400 text-sm mt-2">... e mais {dados.length - 10} registros</p>
                )}
              </div>

              <div className="blueprint-divider mt-6 mb-4"></div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setPreview(false);
                    setDados([]);
                  }}
                  className="blueprint-btn"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportar}
                  disabled={isLoading || importarMutation.isPending}
                  className="blueprint-btn bg-green-700 hover:bg-green-600 disabled:opacity-50"
                >
                  {isLoading || importarMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    "Confirmar Importação"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {resultado && (
          <div className="blueprint-card max-w-2xl">
            <div className="space-y-6">
              <div className="text-center">
                {resultado.erro === 0 ? (
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                )}
                <h2 className="text-2xl font-bold text-white mb-2">Importação Concluída</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-900/20 border border-blue-500 rounded">
                  <span className="text-gray-300">Total de registros:</span>
                  <span className="text-white font-bold">{resultado.total}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-900/20 border border-green-500 rounded">
                  <span className="text-gray-300">Importados com sucesso:</span>
                  <span className="text-green-400 font-bold">{resultado.sucesso}</span>
                </div>
                {resultado.erro > 0 && (
                  <div className="flex justify-between items-center p-4 bg-red-900/20 border border-red-500 rounded">
                    <span className="text-gray-300">Erros:</span>
                    <span className="text-red-400 font-bold">{resultado.erro}</span>
                  </div>
                )}
              </div>

              {resultado.erros.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Detalhes dos Erros</h3>
                  <div className="blueprint-divider mb-4"></div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {resultado.erros.map((erro, i) => (
                      <div key={i} className="text-sm text-red-400 bg-red-900/10 p-2 rounded border border-red-900">
                        <strong>Linha {erro.linha}:</strong> {erro.mensagem}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="blueprint-divider mt-6 mb-4"></div>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setResultado(null);
                    setDados([]);
                    setPreview(false);
                  }}
                  className="blueprint-btn"
                >
                  Nova Importação
                </button>
                <button
                  onClick={() => setLocation("/militares")}
                  className="blueprint-btn bg-blue-600 hover:bg-blue-500"
                >
                  Ir para Militares
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
