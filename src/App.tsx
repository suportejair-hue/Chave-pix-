import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Dashboard from './pages/Dashboard';
import EditKey from './pages/EditKey';
import Settings from './pages/Settings';
import PublicPayment from './pages/PublicPayment';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/nova" element={<EditKey />} />
        <Route path="/editar/:id" element={<EditKey />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/pagar/:linkId" element={<PublicPayment />} />
      </Routes>
    </BrowserRouter>
  );
}
