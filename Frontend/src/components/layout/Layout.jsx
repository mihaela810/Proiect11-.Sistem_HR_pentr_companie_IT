import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#1e1e1e',
    }}>

      <Sidebar />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}>
        <Navbar />

        {/* continutul paginii curente se randeaza aici */}
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          color: '#d4d4d4',
          fontFamily: 'Consolas, monospace',
        }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}