import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Context'
import { DateTime } from "luxon";
import {findVakit} from "../utils"


function VakitCounter(props){
    var {vakitler,vakit,currentVakit, setCurrentVakit,loading,error} = useContext(AppContext)
    const [counter, setCounter] = useState(DateTime.now());
    useEffect(() => {
        if(currentVakit=="vakityok" ||  !(findVakit(vakit)==currentVakit) ){  setCurrentVakit(findVakit(vakit)) }
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


    

    return (!loading&&!error&&currentVakit!=="vakityok") ? (
    
        <div className="vakitCounter text-white">
        {
        /*
            <div className="vakit">
                <span className="current">{!(vakit=="vakityok") ? vakit[currentVakit].name : ""}</span>
                <span className="next">{ !(vakit=="vakityok")? vakit[vakit[currentVakit].next].name : "" }</span>
            </div>
        */
        }
        <span className="vakit">
        <span className="current">{currentVakit}</span>
        <span className="next"></span>

     
        
        </span>

            <span className="counterlabel">vaktin çıkmasına</span>
            <div className="counter ">
            {counter.hours + ":" + counter.minutes + ":"+ Number(counter.seconds).toFixed() }
            </div>
            <span className="kerahat">Kerahat</span>
        </div>
    ):(

        <div className={`vakitCounter text-white ${loading} ${error}`}>
        {error && 'Error!'}
          {loading && 'Loading...'}
          </div>

    )
}




export default VakitCounter
