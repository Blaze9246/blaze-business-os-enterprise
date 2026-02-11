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
import Automation from './pages/Automation'
import Chat from './pages/Chat'
import Orchestrator from './pages/Orchestrator'

function App() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      
      <SignedIn>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="agents" element={<Agents />} />
            <Route path="stores" element={<Stores />} />
            <Route path="leads" element={<Leads />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="reports" element={<Reports />} />
            <Route path="automation" element={<Automation />} />
            <Route path="chat" element={<Chat />} />
            <Route path="orchestrator" element={<Orchestrator />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </SignedIn>
    </>
  )
}

export default App
