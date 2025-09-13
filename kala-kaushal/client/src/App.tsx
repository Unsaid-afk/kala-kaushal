import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Landing from '@/pages/landing'
import Assessment from '@/pages/assessment'
import AthleteDashboard from '@/pages/athlete-dashboard'
import ScoutDashboard from '@/pages/scout-dashboard'
import AthleteProfile from '@/pages/athlete-profile'
import Leaderboard from '@/pages/leaderboard'
import Results from '@/pages/results'
import VideoRecording from '@/pages/video-recording'
import KalaPradarshan from '@/pages/kala-pradarshan'
import NotFound from '@/pages/not-found'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/athlete-dashboard" element={<AthleteDashboard />} />
        <Route path="/scout-dashboard" element={<ScoutDashboard />} />
        <Route path="/athlete-profile/:id" element={<AthleteProfile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/video-recording" element={<VideoRecording />} />
        <Route path="/kala-pradarshan" element={<KalaPradarshan />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
