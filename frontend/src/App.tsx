import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Agents from './pages/Agents'
import Stores from './pages/Stores'
import Settings from './pages/Settings'
import Leads from './pages/Leads'
import Workflows from './pages/Workflows'
import Reports from './pages/Reports'

function App() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      
      <SignedIn>
        <Routes>
          <Route path="/" element={<Layout />>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="agents" element={<Agents />} />
            <Route path="stores" element={<Stores />} />
            <Route path="leads" element={<Leads />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </SignedIn>
    </>
  )
}

export default App
