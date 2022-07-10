import React from 'react'
import ReactDOM from 'react-dom'
import Seo from "../Components/Seo"

const PrayerTimesPage =(props)=>{
        return(
            <div className=''>
                        <Seo title="Namaz Vakitleri" />
                           <h1 className='topTitle'>{props.topTitle}. </h1> 
                PrayerTimesPage
            </div>
        )
}

export default PrayerTimesPage;
