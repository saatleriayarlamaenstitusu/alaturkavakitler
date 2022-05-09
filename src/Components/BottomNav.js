import React from 'react'
import ReactDOM from 'react-dom'
import {Link , NavLink} from 'react-router-dom'
import SVG from 'react-inlinesvg';

const BottomNav =()=>{
        return(
            <div className=''>
                   <div className="bottomNav">
                <NavLink to="/" className="nav-link">
                    <div className="nav-button">
                    <SVG id="logoGenis" src={`${process.env.PUBLIC_URL}/Icons/Nav/home.svg`} ></SVG>    

                    </div>
                </NavLink>
                <NavLink to="/kesfet" className="nav-link">
                    <div className="nav-button ">
                    <SVG id="logoGenis" src={`${process.env.PUBLIC_URL}/Icons/Nav/clock.svg`} ></SVG>    
                    </div>
                </NavLink>
                <NavLink to="/kategoriler-sirala" className="nav-link location">
                    <div className="nav-button">
                    <SVG id="logoGenis" src={`${process.env.PUBLIC_URL}/Icons/Nav/mosque.svg`} ></SVG>    
                    </div>
                </NavLink>
                
                <NavLink to="/kaydedilenler" className="nav-link location">
                    <div className="nav-button">
                    <SVG id="logoGenis" src={`${process.env.PUBLIC_URL}/Icons/Nav/calendar.svg`} ></SVG>    

                    </div>
                </NavLink>
            </div>
            </div>
        )
}

export default BottomNav;
