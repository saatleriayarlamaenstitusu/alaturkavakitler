import React from 'react'
import ReactDOM from 'react-dom'
import Seo from "../Components/Seo"

const CalendarPage =(props)=>{
        return(
            <div className=''>
                        <Seo title="Takvim" />

                <h1 className='topTitle'>{props.topTitle}. </h1> 

                CalendarPage
            </div>
        )
}

export default CalendarPage;
