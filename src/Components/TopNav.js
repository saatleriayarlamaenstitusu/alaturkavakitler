import React, {useContext} from 'react'
import ReactDOM from 'react-dom'
import SVG from 'react-inlinesvg';
import Select from 'react-select'
import {  CITIES } from "../urls";
import { AppContext } from './Context'

const citiesOptions = Object.values(CITIES).map(function(city){
        return   { value: city.plate, label: city.name }
})

const TopNav =()=>{
        var {city, setCity} = useContext(AppContext);


        function changeCity(e){
		setCity({"plate":e.value, "name":e.label })
        }
        return(
            <div className='topNav'> 
<SVG id="logoGenis" src={`${process.env.PUBLIC_URL}/Icons/logo-wide.svg`} ></SVG>    
<Select className="city" placeholder="Şehir Seç" classNamePrefix="city" value={{ value: city.plate, label: city.name }} options={citiesOptions}  onChange={changeCity}
 />

<button><SVG id="dropdownMenu" src={`${process.env.PUBLIC_URL}/Icons/kababmenu.svg`} ></SVG></button>


 </div>
        )
}

export default TopNav;
