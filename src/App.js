import './App.css';
import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Components/Context'
import { useLocalstorageState } from "rooks";
import useFetch from 'use-http'
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
  const [vakitler, setVakitler] = useLocalstorageState("vakitler", "vakityok");

  const { get,response,loading, error, data: vakitResponse = [] } = useFetch(`${process.env.REACT_APP_VAKIT_BASE_URL+city.plate}.json`)
  useEffect(() => { fetchVakitler() }, [city]) 
  async function fetchVakitler() {
    const data = await get()
    if (response.ok) setVakitler(data)
  }
 

  return (
    <AppContext.Provider value={{ city, setCity, vakitler }}>
      <div className="app">
        <TopNav />
        <div className='appContent'>
        {error && 'Error!'}
      {loading && 'Loading...'}

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
