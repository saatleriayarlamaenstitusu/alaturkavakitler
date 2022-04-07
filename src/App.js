import './App.css';
import { AppContext } from './Components/Context'
import { useLocalstorageState } from "rooks";
import { BrowserRouter, Routes, Route, useLocation, NavLink, useNavigate } from 'react-router-dom'

import TopNav from './Components/TopNav'
import BottomNav from './Components/BottomNav'


import Intro from './Pages/Intro'
import HomePage from './Pages/HomePage'
import ClockPage from './Pages/ClockPage'
import PrayerTimesPage from './Pages/PrayerTimesPage'
import CalendarPage from './Pages/CalendarPage'
import About from './Pages/About'
import Blog from './Pages/Blog'
import BlogDetails from './Pages/BlogDetails'
import NotFound from './Pages/NotFound'

function App() {
  const [city, setCity] = useLocalstorageState("city", "sehirsec");

  return (
    <AppContext.Provider value={{ city, setCity }}>
      <div className="app">
        <TopNav />
        <div className='appContent'>
          <Routes>
            <Route path='/giris' element={<Intro />} />
            <Route path='/' element={<HomePage />} />
            <Route path='/saat' element={<ClockPage />} />
            <Route path='/vakitler' element={<PrayerTimesPage />} />
            <Route path='/takvim' element={<CalendarPage />} />
            <Route path='/hakkinda' element={<About />} />
            <Route path='/saat-uzerine' element={<Blog />} />
            <Route path='/yazi/:id' element={<BlogDetails />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
          </div>
          <BottomNav />
        </div>
        </AppContext.Provider>  
  );
}

export default App;
