import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Context'


function Clock(props){
    var {vakitler} = useContext(AppContext)
    const [date, setDate] = useState(new Date());
    useEffect(() => {
        const clockInterval = setInterval(()=>setDate(new Date()), 1000);
        return function cleanup() {
            clearInterval(clockInterval);
          };
      }, []);

    /* TODO: Ayarlardan gelen varsayılan ve gösterilecek saate göre düzenlenecek */
    return(
        <div className="clock">
            <div className="normalClock">{date.toLocaleTimeString("tr-tr")}</div>
            <div className="alaturkaClock">

            </div>
            Akşam: { vakitler[getDateKey(date)] && vakitler[ getDateKey(date)].aksam}
        </div>
    )
}


function getDateKey(date){return date.toISOString().split("T")[0]}

//TODO 
function calculateAlaturka(){
    //normal saat akşam vakti ile gece yarısı arasınnda ise o günün akşam vakti
    //    ns-av
    //normal saat akşam vaktinden önceyse önceki günün akşam vakti
    //    bgy-av+ns                  


}

export default Clock
