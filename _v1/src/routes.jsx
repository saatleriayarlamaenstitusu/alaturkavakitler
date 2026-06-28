import React from 'react'

import { Routes, Route } from "react-router-dom";
import Intro from './Pages/Intro'
import HomePage from './Pages/HomePage'
import ClockPage from './Pages/ClockPage'
import PrayerTimesPage from './Pages/PrayerTimesPage'
import CalendarPage from './Pages/CalendarPage'
import About from './Pages/About'
import Blog from './Pages/Blog'
import BlogDetails from './Pages/BlogDetails'
import Amentu from './Pages/Amentu'

import NotFound from './Pages/NotFound'

const MyRoutes = () => {
	return (
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
            <Route path='/amentu' element={<Amentu key="amentu" page="amentu" topTitle="Amentü"/>} />

            <Route path='*' element={<NotFound />} />
          </Routes>
	);
};

export default MyRoutes;