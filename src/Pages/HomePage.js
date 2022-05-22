import React from 'react'
import ReactDOM from 'react-dom'
import Clock from "../Components/Clock"
import VakitCounter from "../Components/VakitCounter"

const HomePage =()=>{
        return(
            <div className='px-5 homePage'>
            <div className="mt-10"><Clock></Clock></div>
            <div className="mt-10"><VakitCounter/></div>

                HomePage
            </div>
        )
}

export default HomePage;
