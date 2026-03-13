import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ChavePix, UserConfig } from '../types';
import PixCard from '../components/PixCard';
import ShareSheet from '../components/ShareSheet';
import { Plus, Settings, LogOut, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

const PUBLIC_USER_ID = 'public_user';

export default function Dashboard() {
  const [chaves, setChaves] = useState<ChavePix[]>([]);
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChave, setSelectedChave] = useState<ChavePix | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'chavesPix'), where('userId', '==', PUBLIC_USER_ID));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChavePix));
      // Sort: favorites first, then by date
      data.sort((a, b) => {
        if (a.favorita === b.favorita) return 0;
        return a.favorita ? -1 : 1;
      });
      setChaves(data);
      setLoading(false);
    });

    const configRef = doc(db, 'configuracoes', PUBLIC_USER_ID);
    const unsubConfig = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as UserConfig);
      }
    });

    return () => {
      unsubscribe();
      unsubConfig();
    };
  }, []);

  const handleToggleFavorite = async (chave: ChavePix) => {
    try {
      await updateDoc(doc(db, 'chavesPix', chave.id), {
        favorita: !chave.favorita
      });
    } catch (error) {
      toast.error('Erro ao favoritar');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta chave?')) {
      try {
        await deleteDoc(doc(db, 'chavesPix', id));
        toast.success('Chave excluída');
      } catch (error) {
        toast.error('Erro ao excluir');
      }
    }
  };

  const handleGenerateLink = async (chave: ChavePix) => {
    try {
      const linkId = Math.random().toString(36).substring(2, 10);
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 24);

      await updateDoc(doc(db, 'chavesPix', chave.id), {
        linkId,
        linkExpiracao: expiration.toISOString()
      });
      
      const fullLink = `${window.location.origin}/pagar/${linkId}`;
      navigator.clipboard.writeText(fullLink);
      toast.success('Link gerado e copiado!');
      setSelectedChave({ ...chave, linkId, linkExpiracao: expiration.toISOString() });
    } catch (error) {
      toast.error('Erro ao gerar link');
    }
  };

  const filteredChaves = chaves.filter(c => 
    c.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.chave.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Minhas Chaves PIX</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/configuracoes')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por apelido ou chave..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium">Carregando suas chaves...</p>
          </div>
        ) : filteredChaves.length > 0 ? (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredChaves.map((chave) => (
                <PixCard 
                  key={chave.id}
                  chave={chave}
                  onEdit={(c) => navigate(`/editar/${c.id}`)}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onShare={(c) => setSelectedChave(c)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhuma chave encontrada</h3>
            <p className="text-slate-500 mt-2">Comece adicionando sua primeira chave PIX clicando no botão abaixo.</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/nova')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-200 flex items-center justify-center transition-all active:scale-90 hover:scale-110 z-40"
      >
        <Plus size={32} />
      </button>

      {/* Share Sheet */}
      <ShareSheet 
        chave={selectedChave}
        config={config}
        onClose={() => setSelectedChave(null)}
        onGenerateLink={handleGenerateLink}
      />
    </div>
  );
}
