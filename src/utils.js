import  {useEffect,useRef} from 'react'
import { DateTime } from "luxon";
import 'hijri-date';

const hijriMonths= ['Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'];

function createVakitObj(vakitler){
    var vakit = {
      "imsak": {
        "key":"imsak",
        name: "İmsak",
        label: "İmsak'a",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "gunes",
        nextRamazan: "aksam",
        color:"#00b7ff"
      },
      "gunes": {
        "key":"gunes",
        name: "Güneş",
        label: "Güneş'e",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "ogle",
        nextRamazan: "aksam",
        color:"#ffbd33"
      },
      "ogle": {
        "key":"ogle",
        name: "Öğle",
        label: "Öğle'ye",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "ikindi",
        nextRamazan: "aksam",
        color:"#ffd733"
      },
      "ikindi": {
        "key":"ikindi",
        name: "İkindi",
        label: "İkindi'ye",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "aksam",
        nextRamazan: "aksam",
        color:"#ff8c33"
      },
      "aksam": {
        "key":"aksam",
        name: "Akşam",
        label: "Akşam'a",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "yatsi",
        nextRamazan: "imsak",
        color:"#0491fb"
      },
      "yatsi": {
        "key":"yatsi",
        name: "Yatsı",
        label: "Yatsı'ya",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "imsak",
        nextRamazan: "imsak",
        color:"#2e3b83"
      }
    }
    var bugunISO = DateTime.now().toISODate()
    var yarinISO = DateTime.now().plus({day:1}).toISODate()
    var bugun = vakitler[bugunISO]
    var yarin = vakitler[yarinISO]

    for (const key in bugun) {
        vakit[key]["value"]=bugun[key];
        vakit[key]["valueDateObj"]= DateTime.fromISO(bugunISO+"T"+bugun[key]);
    }

    for (const key in yarin) {
        vakit[key]["value2"]=yarin[key];
        vakit[key]["valueDateObj2"]= DateTime.fromISO(yarinISO+"T"+yarin[key]);
    }

    return vakit;  
  }

  function findVakit(vakitObj){
    var now = DateTime.now();
    var minDifference = -Infinity;
    var currentVakit = "yatsi";
    var difference;
    for (var vakit in vakitObj) {
        difference = vakitObj[vakit].valueDateObj-now;
         if (difference > minDifference && difference < 0) {
            minDifference = difference;
            currentVakit = vakit;
        }
        //TODO alturka vakit sırasına göre düzenleme (akşam yatsı imsak gunes ogle ikindi)
    }
   return currentVakit;  
  }

function isKerahat(counter,currentVakit,vakit){
if(currentVakit=="ikindi"){
  return counter.hours==0&&counter.minutes<45
}
else if(currentVakit=="gunes"){
  return (counter.hours==0&&counter.minutes<45) || (vakit["gunes"].valueDateObj.plus({ minutes: 45 })> DateTime.now())
}

return false;
}


  //TODO find alaturka fonksiyonunu buraya geçir

  //todo akşam vaktinden sonra gün değiştir
function nowHijri(format){
  var hDate= new Date().toHijri();
  if (format=="object"){
    return {date:hDate._date, month:hDate._month,monthName:hijriMonths[hDate._month-1], year:hDate._year}
  }

  else{
    return `${hDate._date} ${hijriMonths[hDate._month-1]} ${hDate._year} `
  }

return ``

}


function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  },[value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}



  export { createVakitObj,findVakit,nowHijri,isKerahat,usePrevious}