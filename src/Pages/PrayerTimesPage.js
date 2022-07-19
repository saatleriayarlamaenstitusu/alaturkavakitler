import React from 'react'
import ReactDOM from 'react-dom'
import Seo from "../Components/Seo"
import VakitCounter from "../Components/VakitCounter"
import VakitList from "../Components/VakitList"

const PrayerTimesPage =(props)=>{
        return(
            <div className='PrayerTimesPage'>
                        <Seo title="Namaz Vakitleri" />
                <h1 className='topTitle big mb-0 mt-5'>{props.topTitle}. </h1> 
               <div className=" px-5"><VakitCounter/></div>
            <div className="mt-3 mx-5 mb-5 "><VakitList/></div>
            </div>
        )
}

export default PrayerTimesPage;
