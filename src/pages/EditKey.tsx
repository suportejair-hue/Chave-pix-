import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PixType, ChavePix } from '../types';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import React from 'react';

const PUBLIC_USER_ID = 'public_user';

export default function EditKey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const [formData, setFormData] = useState({
    apelido: '',
    tipo: 'CPF' as PixType,
    chave: '',
    favorita: false
  });

  useEffect(() => {
    if (id) {
      const fetchKey = async () => {
        try {
          const docRef = doc(db, 'chavesPix', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as ChavePix;
            setFormData({
              apelido: data.apelido,
              tipo: data.tipo,
              chave: data.chave,
              favorita: data.favorita
            });
          }
        } catch (error) {
          toast.error('Erro ao carregar chave');
        } finally {
          setFetching(false);
        }
      };
      fetchKey();
    }
  }, [id]);

  const applyMask = (val: string, type: PixType) => {
    const digits = val.replace(/\D/g, '');
    if (type === 'CPF') {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
    }
    if (type === 'CNPJ') {
      return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
        .substring(0, 18);
    }
    if (type === 'Telefone') {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
    return val;
  };

  const handleChaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (['CPF', 'CNPJ', 'Telefone'].includes(formData.tipo)) {
      setFormData({ ...formData, chave: applyMask(val, formData.tipo) });
    } else {
      setFormData({ ...formData, chave: val });
    }
  };

  const validate = () => {
    if (!formData.apelido) return 'Apelido é obrigatório';
    if (!formData.chave) return 'Chave é obrigatória';
    if (formData.tipo === 'E-mail' && !formData.chave.includes('@')) return 'E-mail inválido';
    if (formData.tipo === 'CPF' && formData.chave.replace(/\D/g, '').length !== 11) return 'CPF deve ter 11 dígitos';
    if (formData.tipo === 'CNPJ' && formData.chave.replace(/\D/g, '').length !== 14) return 'CNPJ deve ter 14 dígitos';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        userId: PUBLIC_USER_ID,
        updatedAt: serverTimestamp()
      };

      if (id) {
        await updateDoc(doc(db, 'chavesPix', id), data);
        toast.success('Chave atualizada!');
      } else {
        await addDoc(collection(db, 'chavesPix'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success('Chave cadastrada!');
      }
      navigate('/');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">{id ? 'Editar Chave' : 'Nova Chave PIX'}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Apelido da Chave</label>
            <input 
              type="text"
              placeholder="Ex: PIX Pessoal, Conta Nubank..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.apelido}
              onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Chave</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['CPF', 'CNPJ', 'E-mail', 'Telefone', 'Aleatória'] as PixType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: t, chave: '' })}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${formData.tipo === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Chave PIX</label>
            <input 
              type="text"
              placeholder={formData.tipo === 'Aleatória' ? 'Cole a chave aleatória aqui' : `Digite seu ${formData.tipo}`}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
              value={formData.chave}
              onChange={handleChaveChange}
            />
          </div>

          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input 
              type="checkbox"
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.favorita}
              onChange={(e) => setFormData({ ...formData, favorita: e.target.checked })}
            />
            <span className="text-sm font-bold text-slate-700">Marcar como favorita</span>
          </label>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
              Salvar
            </button>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
