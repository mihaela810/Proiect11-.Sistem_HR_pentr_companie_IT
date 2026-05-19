import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// layout
import Layout from './components/layout/Layout';

// pages
import LoginPage          from './pages/LoginPage';
import DashboardPage      from './pages/DashboardPage';
import AngajatiPage       from './pages/AngajatiPage';
import AngajatProfilPage  from './pages/AngajatProfilPage';
import AngajatFormPage    from './pages/AngajatFormPage';
import ArhivaPage         from './pages/ArhivaPage';
import ConcediiPage       from './pages/ConcediiPage';
import EvaluariPage       from './pages/EvaluariPage';
import ProiectePage       from './pages/ProiectePage';
import DepartamentePage   from './pages/DepartamentePage';
import PozitiiPage        from './pages/PozitiiPage';
import BeneficiiPage      from './pages/BeneficiiPage';
import MLComparatiePage   from './pages/MLComparatiePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ruta publica */}
        <Route path="/login" element={<LoginPage />} />

        {/* rute protejate — toate infasurate in Layout (Sidebar + Navbar) */}
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"            element={<DashboardPage />} />
          <Route path="/angajati"             element={<AngajatiPage />} />
          <Route path="/angajati/nou"         element={<AngajatFormPage />} />
          <Route path="/angajati/:id"         element={<AngajatProfilPage />} />
          <Route path="/angajati/:id/editeaza" element={<AngajatFormPage />} />
          <Route path="/angajati/arhiva"      element={<ArhivaPage />} />
          <Route path="/concedii"             element={<ConcediiPage />} />
          <Route path="/evaluari"             element={<EvaluariPage />} />
          <Route path="/proiecte"             element={<ProiectePage />} />
          <Route path="/departamente"         element={<DepartamentePage />} />
          <Route path="/pozitii"              element={<PozitiiPage />} />
          <Route path="/beneficii"            element={<BeneficiiPage />} />
          <Route path="/ml"                   element={<MLComparatiePage />} />
        </Route>

        {/* orice alta ruta -> dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;