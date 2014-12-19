function zeroPrefix(input, num) {
    input = input.toString();
    num = num || 2;
    if (num > 500) return input;
    while (input.length < num) input = "0" + input;
    return input;
}
// A utility class that provides an interface for executing date and time related functions.
var CD3 = {
    // damn you Augustus
    // we had a system
    // days in each of the months of the year (for offseting)
    months: [31,28,31,30,31,30,31,31,30,31,30,31],
    // long, proper terms for the months of the year
    monthNames: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    // short terms for the months of the year
    monthShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    // long, proper terms for the weekdays
    dayNames: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    // short terms for the weekdays
    dayShort: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    // the offsets that define when to carry over to the next value
    offset: [9001,12,0,24,60,60], // it's over NINE-THOUSAND!!!! - also by 9001AD me and this program would be long dead
    // human-readable terms for the six values to be appended accordingly
    terms: ["year","month","day","hour","minute","second"],
    LONG_CDOWN: "[0]({y} {yyy})[1]({M} {MMM})[2]({d} {ddd})[3]({h} {hhh})[4]({m} {mmm})[5]({s} {sss})",
    SHORT_CDOWN: "[2]({D} {ddd})[3]({hh}:)[4]({mm}:)[5]({ss})"
};
// Calculates the difference between two dates (given as UNIX timestamps).
CD3.difference = function (before, after, format) {
    if (before > after || isNull(before) || isNull(after)) return null; // my work here is done
    var bTime = CD3.dateToArray(new Date(before)),
        aTime = CD3.dateToArray(new Date(after)),
        diff = new Array(6),
        active = null,
        finalCountdown = "";
    if (bTime[0] % 4 == 0) CD3.months[1] = 29; // yay for leap years
    CD3.offset[2] = CD3.months[(aTime[1]+(CD3.months.length-1))%CD3.months.length];
    for (var i=5;i>=0;i--) { // where the magic happens
        if (aTime[i] - bTime[i] < 0) { // if it turns out that the before value is larger
            aTime[i-1]--; // take away from the next (to the left) value
            diff[i] = CD3.offset[i] - Math.abs(aTime[i] - bTime[i]); // and the diff uses the offset to calculate the value
        } else diff[i] = aTime[i] - bTime[i]; // otherwise it's as simple as pie (not pi, although it's not complex) {MATH JOKE}
    }
    return CD3.formatDiff(diff, format);
}
// Takes a difference array (6 length) and formats the string as specified by formatstr.
CD3.formatDiff = function (diff, formatstr) {
    // an example could be "[2]({D} {ddd})[3]({hh}:)[4]({mm}:)[5]({ss})"
    // or "[0]({y} {yyy})[1]({m} {mmm})[2]({d} {ddd})[3]({H} {HHH})[4]({M} {MMM})[5]({S} {SSS})"
    var formats = {
        "y": diff[0],
        "yy": zeroPrefix(diff[0]),
        "yyy": CD3.terms[0] + (diff[0] == 1 ? " " : "s "),
        "M": diff[1],
        "MM": zeroPrefix(diff[1]),
        "MMM": CD3.terms[1] + (diff[1] == 1 ? " " : "s "),
        "d": diff[2],
        "dd": zeroPrefix(diff[2]),
        "ddd": CD3.terms[2] + (diff[2] == 1 ? " " : "s "),
        "D": parseInt(diff[2]) + (diff[1]*CD3.offset[2]) + (diff[0]*(365+(CD3.months[1]==29?1:0))),
        "DD": zeroPrefix(parseInt(diff[2]) + (diff[1]*CD3.offset[2]) + (diff[0]*(365+(CD3.months[1]==29?1:0)))),
        "h": diff[3],
        "hh": zeroPrefix(diff[3]),
        "hhh": CD3.terms[3] + (diff[3] == 1 ? " " : "s "),
        "m": diff[4],
        "mm": zeroPrefix(diff[4]),
        "mmm": CD3.terms[4] + (diff[4] == 1 ? " " : "s "),
        "s": diff[5],
        "ss": zeroPrefix(diff[5]),
        "sss": CD3.terms[5] + (diff[5] == 1 ? " " : "s "),
        "{": "{",
        "}": "}"
    }, active = null;
    for (var format in formats) if (formats.hasOwnProperty(format))
        while (formatstr.search("{"+format+"}") != -1) formatstr = formatstr.replace("{"+format+"}", formats[format]);
    for (var i=0;i<diff.length;i++) if (diff[i] > 0 && isNull(active)) active = i; // finding the significant value(s)
    if (isNull(active)) return null; // another check for bailing out now
    for (var i=0;i<active;i++) formatstr = formatstr.replace(new RegExp("\\["+i+"\\]\\([^\\)]{1,}\\)"), ""); // removing irrelevancy
    // gets rid of the designations
    while (formatstr.search(/(\[[0-9]\]\([^\)]{1,}\)|\))/) != -1) formatstr = formatstr.replace(/(\)?\[[0-9]\]\(|\))/, "");
    // returns the string either as is, or if it has a space at the end instead of a character, return without the trailing space
    return formatstr.charAt(formatstr.length-1) == ' ' ? formatstr.substring(0, formatstr.length-1) : formatstr;
}
// Does what it advertises.
CD3.dateToArray = function (time) {
    return [time.getFullYear(), 
            time.getMonth(), 
            time.getDate(), 
            time.getHours(), 
            time.getMinutes(), 
            time.getSeconds()
    ];
}
// Also does what it advertises.
CD3.arrayToDate = function (year, month, date, hour, minute, second) {
    var time = new Date();
    time.setFullYear(year);
    time.setMonth(month);
    time.setDate(date);
    time.setHours(hour);
    time.setMinutes(minute);
    time.setSeconds(second);
    return time;
}
// Takes a date object and returns a formatted string referring to that object as specified in formatstr.
CD3.format = function (time, formatstr) {
    // formatstr has zero or more of the following letter sequences 
    // surrounded by block (curly) brackets in addition to other
    // characters to specify the format of the moment in question.
    // e.g. "{yyyy}-{MM}-{DD} {HH}:{mm}:{ss}" would deliver an ISO
    // formatted date and time.
    var formats = {
        "dddd": CD3.dayNames[time.getDay()], // long day (Sunday)
        "ddd": CD3.dayShort[time.getDay()], // short day (Sun)
        "dd": zeroPrefix(time.getDate()) + (time.getDate()%10==1?"st":time.getDate()%10==2?"nd":time.getDate()%10==3?"rd":"th"), // prefixed dateth (01st)
        "d": time.getDate() + (time.getDate()%10==1?"st":time.getDate()%10==2?"nd":time.getDate()%10==3?"rd":"th"), // dateth (1st)
        "DD": zeroPrefix(time.getDate()), // prefixed date (02)
        "D": time.getDate(), // date (2)
        "MMMM": CD3.monthNames[time.getMonth()], // long month (March)
        "MMM": CD3.monthShort[time.getMonth()], // short month (Mar)
        "MM": zeroPrefix(time.getMonth()+1), // prefixed month (03)
        "M": time.getMonth()+1, // month (3)
        "yyyy": time.getFullYear(), // long year (2004)
        "yy": time.getFullYear().toString().substring(2,4), // short year (04)
        "HH": zeroPrefix(time.getHours()), // prefixed hours (04)
        "H": time.getHours(), // hours (4)
        "hh": (time.getHours()==0||time.getHours()==12?"12":zeroPrefix(time.getHours()%12)), // prefixed 12-hour (05) from (17)
        "h": (time.getHours()==0||time.getHours()==12?"12":time.getHours()%12), // 12-hour (5) from (17)
        "mm": zeroPrefix(time.getMinutes()), // prefixed minutes (06)
        "m": time.getMinutes(), // minutes (6)
        "ss": zeroPrefix(time.getSeconds()), // prefixed seconds (07)
        "s": time.getSeconds(), // seconds (7)
        "tt": (time.getHours()<12?"AM":"PM"), // AM/PM (PM)
        "{": "{",
        "}": "}"
        // 2004-03-02 04:06:07 given as 24-hour example
        // and 17:06:07 (05:06:07 PM) given as 12-hour example
    }
    for (var format in formats) if (formats.hasOwnProperty(format))
        while (formatstr.search("{"+format+"}") != -1) formatstr = formatstr.replace("{"+format+"}", formats[format]);
    return formatstr;
}
// Validates the six values of a countdown.
CD3.validate = function (year, month, date, hour, minute, second) {
    try {
        if (isNull(year) || isNull(month) || isNull(date) || isNull(hour) || isNull(minute) || isNull(second))
            throw new TypeError("Null values are not allowed.");
        if (isNaN(year) || isNaN(month) || isNaN(date) || isNaN(hour) || isNaN(minute) || isNaN(second))
            throw new TypeError("Non-numerical values are not allowed.");
        else if (year < -9001 || month < 0 || date < 1 || hour < 0 || minute < 0 || second < 0)
            throw new RangeError("Values provided are negative.");
        else if (year >= CD3.offset[0] || month >= CD3.offset[1] || date > CD3.months[month] ||
                hour >= CD3.offset[3] || minute >= CD3.offset[4] || second >= CD3.offset[5])
            throw new RangeError("Values provided are out of range.");
    } catch (e) { TBI.error(e); return null }
    finally { return [year,month,date,hour,minute,second] }
}
