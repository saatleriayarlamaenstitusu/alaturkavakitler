import React, {useContext,useEffect, useState} from 'react'
import { AppContext } from './Context'
import { DateTime } from "luxon";


function Clock(props){
    var {vakitler} = useContext(AppContext)
    const [date, setDate] = useState(DateTime.now());
    useEffect(() => {
        const clockInterval = setInterval(()=>setDate(DateTime.now()), 1000);
        return function cleanup() {
            clearInterval(clockInterval);
          };
      }, []);

    /* TODO: Ayarlardan gelen varsayılan ve gösterilecek saate göre düzenlenecek */
    return(
        <div className="clock">
            <div className="normalClock primaryClock">{date.setLocale('tr').toLocaleString(DateTime.TIME_SIMPLE)}</div>
            <div className="alaturkaClock secondaryClock">
            {calculateAlaturka(date,vakitler)}
            </div>
            Akşam: { vakitler[date.toISODate()] && vakitler[ date.toISODate()].aksam}
        </div>
    )
}



//TODO 
function calculateAlaturka(date, vakitler){
var aksam=DateTime.fromSQL( date.toISODate() +" " + vakitler[ date.toISODate()].aksam)

//normal saat akşam vaktinden önceyse önceki günün akşam vakti
    //    bgy-av+ns 
if(date < aksam)  {
    var dunaksam = DateTime.fromSQL( date.minus({days:1}).toISODate() +" " + vakitler[ date.minus({days:1}).toISODate()].aksam) 
   return date.diff(dunaksam).toFormat("hh:mm")
}
//normal saat akşam vakti ile gece yarısı arasınnda ise o günün akşam vakti
    //    ns-av
    
else{
    return date.diff(aksam).toFormat("hh:mm")
}             

}

export default Clock
