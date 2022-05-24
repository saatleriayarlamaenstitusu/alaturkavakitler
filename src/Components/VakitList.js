import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Context'

function VakitList(props){
    var {vakit,currentVakit, setCurrentVakit,loading,error} = useContext(AppContext)

console.log(vakit)
return vakit=="vakityok"?"Loading":(
<div className='vakitList '>
{Object.values(vakit).map(item=>{return(
    <div className={"vakit " +(currentVakit==item.key?"active":"")}>
    <span className='label'>{item.name}</span>
    <span className='value'>{item.valueDateObj.toFormat("hh:mm")}</span>
    </div>

)})}


</div>


)


}

export default VakitList;