import { X, MessageCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { ChavePix, UserConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface ShareSheetProps {
  chave: ChavePix | null;
  config: UserConfig | null;
  onClose: () => void;
  onGenerateLink: (chave: ChavePix) => void;
}

export default function ShareSheet({ chave, config, onClose, onGenerateLink }: ShareSheetProps) {
  if (!chave) return null;

  const shareWhatsApp = () => {
    const message = `💰 PIX PARA PAGAMENTO 💰\n\n🔑 CHAVE: ${chave.chave}\n📌 TIPO: ${chave.tipo}\n🏷️ REF: ${chave.apelido}\n\n👉 Copie a chave acima e cole no seu app do banco.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareEnrichedWhatsApp = () => {
    const link = `${window.location.origin}/pagar/${chave.linkId}`;
    const message = `💰 PAGAMENTO VIA PIX - ${config?.nomeEmpresa || 'Minha Empresa'}\n\nChave: ${chave.chave}\nTipo: ${chave.tipo}\n\n${config?.telefone ? `📞 Contato: ${config.telefone}\n` : ''}${config?.endereco ? `📍 Endereço: ${config.endereco}\n` : ''}\n🔗 Link seguro: ${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Compartilhar Chave PIX</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-center border border-slate-100">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">{chave.tipo} • {chave.apelido}</p>
              <h3 className="text-2xl font-mono font-bold text-slate-900 break-all leading-tight">
                {chave.chave}
              </h3>
            </div>

            <div className="space-y-3">
              <button 
                onClick={shareWhatsApp}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] hover:bg-[#20bd5b] text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-green-100"
              >
                <MessageCircle size={24} />
                Compartilhar via WhatsApp
              </button>

              <button 
                onClick={() => onGenerateLink(chave)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100"
              >
                <LinkIcon size={24} />
                Criar Link de Pagamento
              </button>

              {chave.linkId && (
                <button 
                  onClick={shareEnrichedWhatsApp}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all active:scale-95"
                >
                  <ExternalLink size={24} />
                  WhatsApp com Link Seguro
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
