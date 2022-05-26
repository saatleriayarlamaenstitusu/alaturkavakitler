import React from 'react'
import ReactDOM from 'react-dom'
import Clock from "../Components/Clock"
import VakitCounter from "../Components/VakitCounter"
import VakitList from "../Components/VakitList"
import Takvim from "../Components/Takvim"


const HomePage =()=>{
        return(
            <div className='homePage'>
            <div className="mt-10 px-5"><Clock></Clock></div>
            <div className="mt-10 px-5"><VakitCounter/></div>
            <div className="mt-10 "><VakitList/></div>
            <div className=""><Takvim/></div>

            </div>
        )
}

export default HomePage;
