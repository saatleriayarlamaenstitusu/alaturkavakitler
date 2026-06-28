import React, { useContext, useEffect, useState } from "react";
import { nowHijri } from "../utils";
import { DateTime } from "luxon";
import SVG from 'react-inlinesvg';

function Calendar(props) {
	const [hijriDate, setHijriDate] = useState(nowHijri("object"));
    const [date, setDate] = useState(DateTime.now());

	//TODO ayarlardan ana takvime göre düzenle
	return (
		<div className="anasayfaCalendar">
			<div className="calendars">
				<div className="primaryCalendar">
                    <div className="day">{hijriDate.date.toString().padStart(2,"0")}</div>
                    <div className="monthandyear"><span>{hijriDate.monthName}</span><span>{hijriDate.year}</span></div>
                </div>

                <div className="secondaryCalendar">
				<b>{date.setLocale('tr').day.toString().padStart(2,"0")}</b>
				{date.setLocale('tr').monthLong} {date.setLocale('tr').year}
                    <div className="dayName">{date.setLocale('tr').weekdayLong}</div>
				
				</div>
			</div>
			<div className="moon">
			<SVG src={`${process.env.PUBLIC_URL}/Icons/moon/${hijriDate.date.toString()}.svg`} ></SVG> 

			</div>
		</div>
	);
}

export default Calendar;
