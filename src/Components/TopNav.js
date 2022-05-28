import React, {useContext} from 'react'
import ReactDOM from 'react-dom'
import SVG from 'react-inlinesvg';
import Select from 'react-select'
import {  CITIES } from "../urls";
import { AppContext } from './Context'
import DropdownMenu from './DropdownMenu';
import {Link , NavLink} from 'react-router-dom'

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
<div className="flex row items-center">
<Select className="city mr-2" placeholder="Şehir Seç" classNamePrefix="city" value={{ value: city.plate, label: city.name }} options={citiesOptions}  onChange={changeCity}/>
<DropdownMenu svgIcon={`${process.env.PUBLIC_URL}/Icons/kababmenu.svg`}>
<NavLink to="/ayarlar" className="nav-link">Ayarlar</NavLink>
<NavLink to="/saatuzerine" className="nav-link">Saat Üzerine</NavLink>
<NavLink to="/yenilikler" className="nav-link">Yenilikler</NavLink>
<NavLink to="/hakkinda" className="nav-link">Hakkında</NavLink>
</DropdownMenu>
</div>

 </div>
        )
}

export default TopNav;
