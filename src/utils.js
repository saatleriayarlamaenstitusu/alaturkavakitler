import { DateTime } from "luxon";

function createVakitObj(vakitler){
    var vakit = {
      "imsak": {
        name: "İmsak",
        label: "İmsak'a",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "gunes",
        nextRamazan: "aksam"
      },
      "gunes": {
        name: "Güneş",
        label: "Güneş'e",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "ogle",
        nextRamazan: "aksam"
      },
      "ogle": {
        name: "Öğle",
        label: "Öğle'ye",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "ikindi",
        nextRamazan: "aksam"
      },
      "ikindi": {
        name: "İkindi",
        label: "İkindi'ye",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "aksam",
        nextRamazan: "aksam"
      },
      "aksam": {
        name: "Akşam",
        label: "Akşam'a",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "yatsi",
        nextRamazan: "imsak2"
      },
      "yatsi": {
        name: "Yatsı",
        label: "Yatsı'ya",
        value: "",
        valueDateObj: "",
        value2: "",
        valueDateObj2: "",
        icon: "",
        next: "imsak2",
        nextRamazan: "imsak2"
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
    for (var vakit in vakitObj) {
        let difference = vakitObj[vakit].valueDateObj - now;
         if (difference > minDifference && difference < 0) {
            minDifference = difference;
            currentVakit = vakit;
        }

        //TODO alturka vakit sırasına göre düzenleme (akşam yatsı imsak gunes ogle ikindi)
        /*
        difference = vakitObj[vakit].valueDateObj2 - now;
        if (difference > minDifference && difference < 0) {
            minDifference = difference;
            currentVakit = vakit+"2";
        }
        */

    }

   return currentVakit;  
  }

  //TODO find alaturka fonksiyonunu buraya geçir





  export { createVakitObj,findVakit}