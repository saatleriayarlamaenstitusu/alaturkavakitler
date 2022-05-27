import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Context'
import { DateTime } from "luxon";
function VakitList(props){
    var {vakit,currentVakit, setCurrentVakit,loading,error} = useContext(AppContext)


return vakit=="vakityok"?"Loading":(
<div className='vakitList '>
{Object.values(vakit).map(item=>{return(
    <div className={"vakit " +(currentVakit==item.key?"active":"")}>
    <span className='label'>{item.name}</span>
    <span className='value'>{item.valueDateObj ? item.valueDateObj.setLocale("tr").toLocaleString(DateTime.TIME_SIMPLE):""}</span>
    </div>

)})}


</div>


)


}

export default VakitList;
