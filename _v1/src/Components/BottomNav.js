import React from 'react'
import ReactDOM from 'react-dom'
import {Link , NavLink} from 'react-router-dom'
import SVG from 'react-inlinesvg';

const BottomNav =()=>{
        return(
                   <div className="bottomNav">
                <NavLink to="/" className="nav-link">
                    <div className="nav-button">
                    <SVG src={`${process.env.PUBLIC_URL}/Icons/Nav/home.svg`} ></SVG>    

                    </div>
                </NavLink>
                <NavLink to="/saat" className="nav-link">
                    <div className="nav-button ">
                    <SVG src={`${process.env.PUBLIC_URL}/Icons/Nav/clock.svg`} ></SVG>    
                    </div>
                </NavLink>
                <NavLink to="/vakitler" className="nav-link ">
                    <div className="nav-button">
                    <SVG src={`${process.env.PUBLIC_URL}/Icons/Nav/mosque.svg`} ></SVG>    
                    </div>
                </NavLink>
                
                <NavLink to="/takvim" className="nav-link">
                    <div className="nav-button">
                    <SVG src={`${process.env.PUBLIC_URL}/Icons/Nav/calendar.svg`} ></SVG>    

                    </div>
                </NavLink>
            </div>
        )
}

export default BottomNav;
