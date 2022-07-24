import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Context'
import { DateTime } from "luxon";
function VakitRangeView(props){
    var {vakit,currentVakit, setCurrentVakit,loading,error} = useContext(AppContext)

//todo normal saat 12den sonra dünün vakiterini göster
return vakit=="vakityok"?"Loading":(
<div className='VakitRangeView '>
{[...Object.values(vakit), Object.values(vakit)[0]].map((item,index,arr)=>{return(
    <div 
    style={{width:findPercentWidth(item.key, vakit)}}
    className={"vakit " + item.key +(currentVakit==item.key?" active":"")}>
        <span className='label'>{item.name}</span>
        

        {item.key=="gunes"? (
            <>
                <span className='kerahat kerahat1' style={{width:findPercentWidth("kerahat")}}></span>
                <span className='kerahat kerahat2'  style={{width:findPercentWidth("kerahat")}}></span>
            </>
        ) :"" }

        {item.key=="ikindi"? (
            <>
                <span className='kerahat kerahat3' style={{width:findPercentWidth("kerahat")}}></span>
            </>
        ) :"" }
    </div>

)})}


</div>


)


}

function findPercentWidth(vakitid,vakitler){
    var start,end,minute;
    if (vakitid=="kerahat"){
        minute=45;
        return minute * (100/1440) +"%";
    }

   else if (vakitid=="yatsi"){
        start=vakitler[vakitid].valueDateObj;
        end=vakitler["imsak"].valueDateObj2;
    }

    else{
        start=vakitler[vakitid].valueDateObj;
        end=vakitler[vakitler[vakitid].next].valueDateObj;
    }
   minute = end.diff(start, 'minutes').toObject().minutes;


//~0.07;
return minute * (100/1440) +"%";

}

export default VakitRangeView;
