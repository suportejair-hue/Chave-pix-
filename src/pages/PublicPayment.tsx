import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChavePix, UserConfig } from '../types';
import { ShieldCheck, Copy, Instagram, Facebook, MessageCircle, Globe, MapPin, Phone, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

export default function PublicPayment() {
  const { linkId } = useParams();
  const [chave, setChave] = useState<ChavePix | null>(null);
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'chavesPix'), where('linkId', '==', linkId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const chaveData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ChavePix;
          
          // Check expiration
          if (chaveData.linkExpiracao) {
            const expDate = new Date(chaveData.linkExpiracao);
            if (expDate < new Date()) {
              setExpired(true);
              setLoading(false);
              return;
            }
          }

          setChave(chaveData);

          // Fetch company config
          const configRef = doc(db, 'configuracoes', chaveData.userId);
          const configSnap = await getDoc(configRef);
          if (configSnap.exists()) {
            setConfig(configSnap.data() as UserConfig);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [linkId]);

  const copyChave = () => {
    if (chave) {
      navigator.clipboard.writeText(chave.chave);
      toast.success('Chave PIX copiada!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (expired || !chave) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Expirado ou Inválido</h1>
          <p className="text-slate-500 mb-8">Este link de pagamento não é mais válido ou nunca existiu. Por favor, solicite um novo link.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = config?.corPersonalizada || '#0066CC';

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-md mx-auto">
        {/* Company Header */}
        <div className="bg-white pt-12 pb-8 px-6 text-center rounded-b-[3rem] shadow-sm">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg overflow-hidden mb-4 flex items-center justify-center">
              {config?.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Globe size={40} className="text-slate-200" />
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{config?.nomeEmpresa || 'MeuPIX Manager'}</h1>
            
            {config?.mostrarSeloSeguranca && (
              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Link Seguro • Verificado</span>
              </div>
            )}
          </div>
        </div>

        <main className="px-6 -mt-6">
          {/* PIX Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-100 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                <img src="https://logodownload.org/wp-content/uploads/2020/10/pix-logo-2.png" className="w-10 h-10 invert brightness-0" alt="PIX" />
              </div>

              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Chave {chave.tipo}</p>
              <h2 className="text-3xl font-mono font-black text-slate-900 break-all leading-tight mb-8">
                {chave.chave}
              </h2>

              <button 
                onClick={copyChave}
                style={{ backgroundColor: primaryColor }}
                className="w-full py-6 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Copy size={24} />
                COPIAR CHAVE
              </button>
            </div>
          </motion.div>

          {/* Info Section */}
          <div className="mt-8 space-y-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white space-y-4">
              {config?.telefone && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone</p>
                    <p className="text-sm font-bold text-slate-700">{config.telefone}</p>
                  </div>
                </div>
              )}
              {config?.endereco && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço</p>
                    <p className="text-sm font-bold text-slate-700">{config.endereco}, {config.cidade}</p>
                  </div>
                </div>
              )}
              {config?.website && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website</p>
                    <p className="text-sm font-bold text-slate-700">{config.website}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social & Actions */}
            <div className="flex justify-center gap-4">
              {config?.instagram && (
                <a href={`https://instagram.com/${config.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm hover:scale-110 transition-transform">
                  <Instagram size={24} />
                </a>
              )}
              {config?.facebook && (
                <a href={config.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm hover:scale-110 transition-transform">
                  <Facebook size={24} />
                </a>
              )}
            </div>

            {config?.whatsapp && (
              <a 
                href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:brightness-110 transition-all"
              >
                <MessageCircle size={20} />
                💬 Falar no WhatsApp
              </a>
            )}

            <div className="flex items-center justify-center gap-2 text-slate-400 py-4">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Link válido por 24h</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
