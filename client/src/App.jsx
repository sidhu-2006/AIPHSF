import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import EmergencyForm from './pages/EmergencyForm'
import HospitalList from './pages/HospitalList'
import AlertConfirmation from './pages/AlertConfirmation'
import NotFound from './pages/NotFound'

function App() {
  return (
    <LanguageProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emergency" element={<EmergencyForm />} />
        <Route path="/hospitals" element={<HospitalList />} />
        <Route path="/alert-confirmation" element={<AlertConfirmation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  )
}

export default App