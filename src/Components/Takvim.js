import React, { useContext, useEffect, useState } from "react";
import { nowHijri } from "../utils";
import { DateTime } from "luxon";

function Takvim(props) {
	const [hijriDate, setHijriDate] = useState(nowHijri("object"));
    const [date, setDate] = useState(DateTime.now());

	//TODO ayarlardan ana takvime göre düzenle
	return (
		<div className="anasayfaCalendar">
			<div className="calendars">
				<div className="primaryCalendar">
                    <div className="day">{hijriDate.date}</div>
                    <div className="monthandyear"><span>{hijriDate.monthName}</span><span>{hijriDate.year}</span></div>
                    <div className="dayName">{date.setLocale('tr').weekdayLong}</div>
                </div>

                <div className="secondaryCalendar"><b>{date.setLocale('tr').day}</b>{date.setLocale('tr').monthLong} {date.setLocale('tr').year}</div>
			</div>
			<div className="moon"></div>
		</div>
	);
}

export default Takvim;
