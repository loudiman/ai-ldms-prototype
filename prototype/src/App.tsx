import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ParcelMap from './pages/ParcelMap'
import Environment from './pages/Environment'
import Permits from './pages/Permits'
import Valuation from './pages/Valuation'
import Community from './pages/Community'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ParcelMap />} />
        <Route path="environment" element={<Environment />} />
        <Route path="permits" element={<Permits />} />
        <Route path="valuation" element={<Valuation />} />
        <Route path="community" element={<Community />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}
