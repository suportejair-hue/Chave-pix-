import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserConfig } from '../types';
import { ArrowLeft, Save, Building2, Globe, Instagram, Facebook, MessageCircle, ShieldCheck, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import React from 'react';

const PUBLIC_USER_ID = 'public_user';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState<UserConfig>({
    userId: '',
    nomeEmpresa: '',
    telefone: '',
    endereco: '',
    cidade: '',
    website: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    mostrarSeloSeguranca: true,
    corPersonalizada: '#0066CC',
    logoUrl: ''
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'configuracoes', PUBLIC_USER_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as UserConfig);
        } else {
          setFormData(prev => ({ ...prev, userId: PUBLIC_USER_ID }));
        }
      } catch (error) {
        toast.error('Erro ao carregar configurações');
      } finally {
        setFetching(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'configuracoes', PUBLIC_USER_ID), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast.success('Configurações salvas!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
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
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Empresa */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="text-blue-600" size={24} />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Sua Empresa</h2>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={32} className="text-slate-300" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest">Logo da Empresa</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nome da Empresa</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.nomeEmpresa}
                  onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Telefone</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Website</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Endereço Completo</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Cidade/UF</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Redes Sociais */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-blue-600" size={24} />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Redes Sociais</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                  <Instagram size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="@usuario"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Facebook size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="link da página"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="WhatsApp opcional"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Personalização */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-blue-600" size={24} />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Personalização</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Cor Primária</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color"
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                    value={formData.corPersonalizada}
                    onChange={(e) => setFormData({ ...formData, corPersonalizada: e.target.value })}
                  />
                  <span className="text-sm font-mono font-bold text-slate-600">{formData.corPersonalizada}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-900">Selo de Segurança</p>
                  <p className="text-xs text-slate-500">Mostrar selo verificado nos links públicos</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, mostrarSeloSeguranca: !formData.mostrarSeloSeguranca })}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.mostrarSeloSeguranca ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.mostrarSeloSeguranca ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {formData.mostrarSeloSeguranca && (
                <div className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl border border-green-100">
                  <ShieldCheck size={18} />
                  <span className="text-sm font-bold">🔒 Link Seguro • Verificado</span>
                </div>
              )}
            </div>
          </section>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={24} />}
            Salvar Configurações
          </button>
        </form>
      </main>
    </div>
  );
}
