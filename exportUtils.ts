import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { formatDateBR } from './dateUtils';

export interface MilitarExport {
  nomeGuerra: string;
  nome: string;
  matricula: string;
  postGrad: string;
  cpf: string;
  dataNascimento: string;
  dataInclusao: string;
  funcao: string;
  regimeEscala: string;
  esqd_sec: string;
  mesFeria: number | null;
  mesAbono: number | null;
  cidadeResidencia: string | null;
  email: string | null;
  telefone: string | null;
  genero: string | null;
  dataAdmissao: string;
  ativo: boolean;
  porteArma: string;
  validadeBienal: string | null;
  validadeIdentidadeMilitar: string | null;
  validadeCnh: string | null;
  categoria: string | null;
  observacoes: string | null;
}

export const exportToExcel = (data: MilitarExport[], filename: string = 'militares.xlsx') => {
  try {
    // Formatar datas para DD-MM-YYYY
    const formattedData = data.map(item => ({
      ...item,
      dataNascimento: item.dataNascimento ? formatDateBR(item.dataNascimento) : '',
      dataInclusao: item.dataInclusao ? formatDateBR(item.dataInclusao) : '',
      dataAdmissao: item.dataAdmissao ? formatDateBR(item.dataAdmissao) : '',
      validadeBienal: item.validadeBienal ? formatDateBR(item.validadeBienal) : '',
      validadeCnh: item.validadeCnh ? formatDateBR(item.validadeCnh) : '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Militares');
    
    // Adjust column widths
    const colWidths = [
      { wch: 15 }, // nomeGuerra
      { wch: 25 }, // nome
      { wch: 12 }, // matricula
      { wch: 12 }, // postGrad
      { wch: 14 }, // cpf
      { wch: 14 }, // dataNascimento
      { wch: 14 }, // dataInclusao
      { wch: 15 }, // funcao
      { wch: 12 }, // regimeEscala
      { wch: 12 }, // esqd_sec
      { wch: 10 }, // mesFeria
      { wch: 10 }, // mesAbono
      { wch: 20 }, // cidadeResidencia
      { wch: 20 }, // email
      { wch: 14 }, // telefone
      { wch: 12 }, // genero
      { wch: 14 }, // dataAdmissao
      { wch: 8 },  // ativo
      { wch: 12 }, // porteArma
      { wch: 14 }, // validadeBienal
      { wch: 20 }, // validadeIdentidadeMilitar
      { wch: 12 }, // validadeCnh
      { wch: 15 }, // categoria
      { wch: 30 }, // observacoes
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw error;
  }
};

export const exportToCSV = (data: MilitarExport[], filename: string = 'militares.csv') => {
  try {
    // Formatar datas para DD-MM-YYYY
    const formattedData = data.map(item => ({
      ...item,
      dataNascimento: item.dataNascimento ? formatDateBR(item.dataNascimento) : '',
      dataInclusao: item.dataInclusao ? formatDateBR(item.dataInclusao) : '',
      dataAdmissao: item.dataAdmissao ? formatDateBR(item.dataAdmissao) : '',
      validadeBienal: item.validadeBienal ? formatDateBR(item.validadeBienal) : '',
      validadeCnh: item.validadeCnh ? formatDateBR(item.validadeCnh) : '',
    }));
    const csv = Papa.unparse(formattedData, {
      header: true,
      skipEmptyLines: true,
    } as any);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    throw error;
  }
};

// PDF export can be added later with jsPDF library
// For now, users can export to Excel or CSV and convert to PDF if needed
