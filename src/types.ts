export type PixType = 'CPF' | 'CNPJ' | 'E-mail' | 'Telefone' | 'Aleatória';

export interface ChavePix {
  id: string;
  tipo: PixType;
  chave: string;
  apelido: string;
  favorita: boolean;
  userId: string;
  linkId?: string;
  linkExpiracao?: string;
  createdAt: string;
}

export interface UserConfig {
  userId: string;
  logoUrl?: string;
  nomeEmpresa?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  mostrarSeloSeguranca?: boolean;
  corPersonalizada?: string;
}
