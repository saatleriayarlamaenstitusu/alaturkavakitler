import './App.css';
import React, {useContext,useEffect, useState,useRef} from 'react'
import { AppContext } from './Components/Context'
import { useLocalstorageState } from "rooks";
import useFetch from 'use-http'
import { BrowserRouter, Routes, Route, useLocation, NavLink, useNavigate } from 'react-router-dom'
import {createVakitObj,findVakit,usePrevious} from "./utils"
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
import { DateTime } from 'luxon';

function App() {
  const [city, setCity] = useLocalstorageState("city", {"plate":"34", "name":"İSTANBUL"});
  const prevCity = usePrevious(city);

  const [vakitler, setVakitler] = useLocalstorageState("vakitler", "vakityok");
  const [vakit, setVakit] = useState("vakityok");
  const [currentVakit, setCurrentVakit] = useState("vakityok");

  const { get,response,loading, error, data: vakitResponse = [] } = useFetch(`${process.env.REACT_APP_VAKIT_BASE_URL+city.plate}.json`)
  async function fetchVakitler() {
    console.log("fetchVakitler")
    const data = await get()
    if (response.ok) {
      setVakitler(data);
    }
  }



  useEffect(() => { 
        /* TODO: saat 12yi geçince vakitleri yeniden çek */
        console.log(city);
        var lastAvailable = vakitler=="vakityok" ? DateTime.now() :  DateTime.fromISO(Object.keys(vakitler)[Object.keys(vakitler).length-1])
        if(vakitler=="vakityok" || lastAvailable.diffNow("days") < 5 ||  (prevCity && city.plate !==  prevCity.plate )){
          fetchVakitler() 
        }
        
      }, [city,get,response]) 
      
      
      
    
  useEffect(() => { 
    setVakit(createVakitObj(vakitler))
    console.log("setVakit")

  }, [vakitler]) 
  

  return (
    <AppContext.Provider value={{ city, setCity, vakitler, vakit ,currentVakit,setCurrentVakit,loading,error}}>
      <div className="app">
        <TopNav />
        <div className='appContent'>
        {error && 'Error!'}
      {loading && 'Loading...'}

          <Routes>
            <Route path='/giris' element={<Intro />} />
            <Route path='/' element={<HomePage />} />
            <Route path='/saat' element={<ClockPage topTitle="saat"/>} />
            <Route path='/vakitler' element={<PrayerTimesPage topTitle="vakitler"/>} />
            <Route path='/takvim' element={<CalendarPage topTitle="takvim"/>} />
            <Route path='/hakkinda' element={<About topTitle="hakkında"/>} />
            <Route path='/saatuzerine' element={<Blog key="saatuzerine" page="saatuzerine" topTitle="saat üzerine"/>} />
            <Route path='/yenilikler' element={<Blog key="yenilikler" page="yenilikler" topTitle="yenilikler"/>} />
            <Route path='detay/:page/:id' element={<BlogDetails />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
          </div>
          <BottomNav />
        </div>
        </AppContext.Provider>  
  );
}






export default App;
