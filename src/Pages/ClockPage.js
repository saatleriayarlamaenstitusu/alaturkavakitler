import React from 'react'
import ReactDOM from 'react-dom'
import Seo from "../Components/Seo"

const ClockPage =(props)=>{
        return(
            <div className=''>
                        <Seo title="Saat" />

                           <h1 className='topTitle'>{props.topTitle}. </h1> 

                ClockPage
            </div>
        )
}

export default ClockPage;
