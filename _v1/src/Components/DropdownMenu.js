import React, {useContext, useState} from 'react'
import SVG from 'react-inlinesvg';

function DropdownMenu(props){
   const [open,setOpen] = useState(false);



    return (
        <div className="dropdown" onClick={()=>setOpen(!open)}>
         {props.svgIcon && <SVG src={props.svgIcon} ></SVG> }
       
        {open&& <div className="dropdownContent">{props.children} </div>}
       
        
        
        </div>


    )

    
}

export default DropdownMenu;
