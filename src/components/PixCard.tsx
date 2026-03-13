import { MoreVertical, Star, Copy, Share2, User, Building2, Mail, Smartphone, Key } from 'lucide-react';
import { ChavePix, PixType } from '../types';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PixCardProps {
  key?: string;
  chave: ChavePix;
  onEdit: (chave: ChavePix) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (chave: ChavePix) => void;
  onShare: (chave: ChavePix) => void;
}

const typeIcons: Record<PixType, any> = {
  'CPF': User,
  'CNPJ': Building2,
  'E-mail': Mail,
  'Telefone': Smartphone,
  'Aleatória': Key
};

export default function PixCard({ chave, onEdit, onDelete, onToggleFavorite, onShare }: PixCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = typeIcons[chave.tipo];

  const maskChave = (val: string, type: PixType) => {
    if (type === 'CPF') {
      return val.replace(/(\d{3})\d{3}\d{3}(\d{2})/, '$1.***.***-$2');
    }
    if (type === 'CNPJ') {
      return val.replace(/(\d{2})\d{3}\d{3}\d{4}(\d{2})/, '$1.***.***/****-$2');
    }
    if (val.length > 15) {
      return val.substring(0, 6) + '...' + val.substring(val.length - 4);
    }
    return val;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chave.chave);
    toast.success('Chave copiada!');
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">{chave.apelido}</h3>
            <p className="text-xs text-slate-500 font-medium">{chave.tipo}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onToggleFavorite(chave)}
            className={`p-2 rounded-full transition-colors ${chave.favorita ? 'text-yellow-400' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <Star size={20} fill={chave.favorita ? 'currentColor' : 'none'} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <MoreVertical size={20} />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 overflow-hidden">
                  <button 
                    onClick={() => { onEdit(chave); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => { onDelete(chave.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-4">
        <p className="text-sm font-mono text-slate-600 break-all">
          {maskChave(chave.chave, chave.tipo)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all active:scale-95"
        >
          <Copy size={16} />
          Copiar
        </button>
        <button 
          onClick={() => onShare(chave)}
          className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-md shadow-blue-100"
        >
          <Share2 size={16} />
          Compartilhar
        </button>
      </div>
    </motion.div>
  );
}
