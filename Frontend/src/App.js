import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';

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
import ProfilMeuPage      from './pages/ProfilMeuPage';
import EchipaPage         from './pages/EchipaPage';
import RapoartePage       from './pages/RapoartePage';
import AuditPage          from './pages/AuditPage';
import HRViewPage         from './pages/HRViewPage';
import DepartamentDetaliiPage from './pages/DepartamentDetaliiPage';
import ProiectDetaliiPage from './pages/ProiectDetaliiPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"              element={<DashboardPage />} />
          <Route path="/profil-meu"             element={<ProfilMeuPage />} />

          {/* angajati */}
          <Route path="/angajati"               element={<AngajatiPage />} />
          <Route path="/angajati/nou"           element={<AngajatFormPage />} />
          <Route path="/angajati/:id"           element={<AngajatProfilPage />} />
          <Route path="/angajati/:id/editeaza"  element={<AngajatFormPage />} />
          <Route path="/angajati/arhiva"        element={<ArhivaPage />} />

          {/* sectiuni */}
          <Route path="/concedii"               element={<ConcediiPage />} />
          <Route path="/evaluari"               element={<EvaluariPage />} />
          <Route path="/proiecte"               element={<ProiectePage />} />
          <Route path="/departamente"           element={<DepartamentePage />} />
          <Route path="/pozitii"                element={<PozitiiPage />} />
          <Route path="/beneficii"              element={<BeneficiiPage />} />
          <Route path="/ml"                     element={<MLComparatiePage />} />

          {/* pagini noi */}
          <Route path="/echipa"                 element={<EchipaPage />} />
          <Route path="/rapoarte"               element={<RapoartePage />} />
          <Route path="/audit"                  element={<AuditPage />} />
          <Route path="/hr-view"                element={<HRViewPage />} />
          <Route path="/departamente/:id" element={<DepartamentDetaliiPage />} />
          <Route path="/detalii-proiecte/:id" element={<ProiectDetaliiPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;