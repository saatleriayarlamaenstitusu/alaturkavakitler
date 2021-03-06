import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Context'
import { DateTime } from "luxon";
import {findVakit,isKerahat} from "../utils"


function VakitCounter(props){
    var {vakitler,vakit,currentVakit, setCurrentVakit,loading,error} = useContext(AppContext)
    const [counter, setCounter] = useState({'hours':"0", 'minutes':0, 'seconds':0});
    useEffect(() => {
        var foundVakit=findVakit(vakit);
        if(currentVakit=="vakityok" ||  !(foundVakit==currentVakit) ){ 
            setCurrentVakit(foundVakit) 
            document.documentElement.dataset.vakit=foundVakit;
            console.log(vakit)
            if(currentVakit!="vakityok"){ document.querySelector("[name=theme-color]").content=vakit[foundVakit].color};
        }
if(currentVakit!=="vakityok"){
    var now=DateTime.now()
    const vakitInterval = setInterval(()=>{
        var nextVakitKey=vakit[currentVakit].next
        var nextVakitObj = (currentVakit=="yatsi"&&vakit[nextVakitKey].valueDateObj<now) ? vakit[nextVakitKey].valueDateObj2 : vakit[nextVakitKey].valueDateObj;
        setCounter(now.until(nextVakitObj).toDuration(['hours', 'minutes', 'seconds']).toObject())
}, 1000);

    return function cleanup() {
        clearInterval(vakitInterval);
      };
}
});
      

    /* TODO: Kerahat vaktine göre ekleme yapılacak */

    /* TODO: Vakit timeline componenti  bu componentte çağrılacak ve bilgiler prop olarak gönderilecek */

    
    return (!loading&&!error&&currentVakit!=="vakityok") ? (
    
        <div className="vakitCounter text-white">
        
            <div className="vakit">
                <span className="current">{!(vakit=="vakityok") ? vakit[currentVakit].name : ""}</span>
                <span className="next">{ !(vakit=="vakityok")? vakit[vakit[currentVakit].next].name : "" }</span>
            </div>

            <span className="counterlabel">vaktin çıkmasına</span>
            <div className="counter ">
            {counter.hours.toString().padStart(2, 0) + ":" + counter.minutes.toString().padStart(2, 0) + ":"+ Number(counter.seconds).toFixed().toString().padStart(2, 0) }
            </div>
            {(currentVakit=="gunes" || currentVakit=="ikindi") && isKerahat(counter,currentVakit,vakit) ? ( <span className="kerahat">Kerahat</span>):""}
        </div>
    ):(

        <div className={`vakitCounter text-white ${loading} ${error}`}>
        {error && 'Error!'}
          {loading && 'Loading...'}
          </div>

    )
}

export default VakitCounter
