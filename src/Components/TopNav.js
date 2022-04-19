import React from 'react'
import ReactDOM from 'react-dom'
import SVG from 'react-inlinesvg';


const TopNav =()=>{
        return(
            <div className='topNav'> 
<SVG id="logoGenis" src={`${process.env.PUBLIC_URL}/Icons/logo-wide.svg`} ></SVG>           

 </div>
        )
}

export default TopNav;
