
Date.prototype.dateAdd = function(interval, number)
 {
    var d = this;
    var k = {
        'y': 'FullYear',
        'q': 'Month',
        'm': 'Month',
        'w': 'Date',
        'd': 'Date',
        'h': 'Hours',
        'n': 'Minutes',
        's': 'Seconds',
        'ms': 'MilliSeconds'
    };
    var n = {
        'q': 3,
        'w': 7
    };
    eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
    return d;
}
Date.prototype.dateDiff = function(interval, objDate2)
 {
    var d = this,
    i = {},
    t = d.getTime(),
    t2 = objDate2.getTime();
    i['y'] = objDate2.getFullYear() - d.getFullYear();
    i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4);
    i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
    i['ms'] = objDate2.getTime() - d.getTime();
    i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
    i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
    i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
    i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
    i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
    return i[interval];
}