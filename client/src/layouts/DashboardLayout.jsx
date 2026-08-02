import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
