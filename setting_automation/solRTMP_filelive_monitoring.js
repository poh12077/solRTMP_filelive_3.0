const xlsx = require("xlsx");
//const fs = require('fs');
const fs = require('graceful-fs');

let running_video = {
    excel: {
        pluto: {},
        samsung_northern_america: {},
        samsung_korea: {}
    },
    solrtmp_log: {
        pluto: {},
        samsung_northern_america: {},
        samsung_korea: {}
    }
}

class video_info_pluto {
    constructor(id, end_time, ad_list) {
        this.id = id;
        this.end_time = end_time;
        this.ad_point = ad_list;
    }
}

//time ='2012-05-17 10:20:30'
let fetch_unix_timestamp = (time) => {
    try {
        return Math.floor(new Date(time).getTime());
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

let time_converter = (x) => {
    try {
        if (typeof (x) === 'string') {
            if (isNaN(Number(x))) {
                const y = x.split(':');
                if (y.length != 3) {
                    throw new Error();
                }
                let time = (parseInt(y[0]) * 3600 + parseInt(y[1]) * 60 + parseInt(y[2])) * 1000;
                return time;
            }
            else {
                return x;
            }
        }
        else if (typeof (x) == 'number') {
            return x;
        }
        else {
            throw new Error();
        }
    }
    catch (err) {
        console.log('[error] time parse');
        console.log(err);
        process.exit(1);
    }
}

let read_conf = (file_name) => {
    try {
        let conf_file = fs.readFileSync(file_name, 'utf8');
        conf_file = JSON.parse(conf_file);

        let conf = {
            file_name: '',
            option: 0,
            start_date: '',
            ad_duration: {
                pluto: '',
                samsung_korea: '',
                samsung_northern_america: ''
            },
            ad_interval:
            {
                samsung_korea: '',
                samsung_northern_america: ''
            }
        }

        conf.file_name = conf_file.file_name;
        conf.option = conf_file.option;
        conf.start_date = fetch_unix_timestamp(conf_file.start_date);
        conf.ad_duration.pluto = conf_file.ad_duration.pluto;
        conf.ad_duration.samsung_korea = conf_file.ad_duration.samsung_korea;
        conf.ad_duration.samsung_northern_america = conf_file.ad_duration.samsung_northern_america;
        conf.ad_interval.samsung_korea = conf_file.ad_interval.samsung_korea;
        conf.ad_interval.samsung_northern_america = conf_file.ad_interval.samsung_northern_america;

        if (conf.option < 1 || conf.option > 4 || conf.start_date <= 0 || conf.ad_duration.pluto <= 0
            || conf.ad_duration.samsung_korea <= 0 || conf.ad_duration.samsung_northern_america <= 0 || conf.ad_interval.samsung_korea <= 0
            || conf.ad_interval.samsung_northern_america <= 0) {
            throw new Error();
        }

        return conf;
    } catch (err) {
        console.log('[error] configure.conf ');
        console.log(err);
        process.exit(1);
    }
}

let read_excel = (excel, conf, i) => {
    try {
        const sheet_name = excel.SheetNames[i];
        const sheet_data = excel.Sheets[sheet_name];
        if (conf.option == 3 || conf.option == 4) {
            if ((sheet_data.E1.v != 'Ad Point 1') || (sheet_data.F1.v != 'Ad Point 2')
                || (sheet_data.G1.v != 'Ad Point 3') || (sheet_data.H1.v != 'Ad Point 4')
                || (sheet_data.I1.v != 'Ad Point 5')) {
                throw new Error('[error] excel Ad Point title');
            }
        }
        let json = xlsx.utils.sheet_to_json(sheet_data);
        return json;
    } catch (err) {
        console.log('[error] excel');
        console.log(err);
        process.exit(1);
    }
}

let parser_excel = (json, conf) => {
    try {
        let schedule = [];
        let end_time = conf.start_date;
        let ad_list = [];
        let m = conf.start_date;

        for (let i = 0; i < json.length; i++) {
            if (json[i].id !== undefined) {
                end_time += json[i]['__EMPTY'];
                //advertisement pluto
                if (conf.option == 3 || conf.option == 4) {
                    for (let k = 1; k < 6; k++) {
                        if (json[i]['Ad Point ' + k.toString()] != undefined) {
                            let ad = {
                                start: '',
                                end: ''
                            }
                            end_time += conf.ad_duration.pluto;
                            ad.start = time_converter(json[i]['Ad Point ' + k.toString()]) + schedule[i - 2].end_time;
                            ad.end = ad.start + conf.ad_duration.pluto;
                            ad_list.push(ad);
                        }
                    }
                }
                //advertisement samsung korea
                else if (conf.option == 1) {
                    for (let k = 1; k > 0; k++) {
                        if (json[i]['__EMPTY'] <= conf.ad_interval.samsung_korea * k) {
                            break;
                        }
                        let ad = {
                            start: '',
                            end: ''
                        }
                        ad.start = m + conf.ad_interval.samsung_korea;
                        ad.end = ad.start + conf.ad_duration.samsung_korea;
                        m = ad.end;
                        end_time += conf.ad_duration.samsung_korea;
                        ad_list.push(ad);
                    }
                }
                //advertisement samsung north america
                else if (conf.option == 2) {
                    for (let k = 1; k > 0; k++) {
                        if (json[i]['__EMPTY'] <= conf.ad_interval.samsung_northern_america * k) {
                            break;
                        }
                        let ad = {
                            start: '',
                            end: ''
                        }
                        ad.start = m + conf.ad_interval.samsung_northern_america;
                        ad.end = ad.start + conf.ad_duration.samsung_northern_america;
                        m = ad.end;
                        end_time += conf.ad_duration.samsung_northern_america;
                        ad_list.push(ad);
                    }
                }
                else {
                    throw new Error('[error] configure option');
                }

                schedule.push(new video_info_pluto(json[i]['id'], end_time, ad_list));
                ad_list = [];
                m = end_time;
            }
        }
        return schedule;
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

//time = '2012-05-17 10:20:30'
let id_finder_excel = (schedule, conf, channel, time) => {
    try {
        let current_time;
        channel = channel.toString();
        if (time === undefined) {
            //current time
            current_time = Math.floor(new Date().getTime());
        } else {
            //input time
            current_time = Math.floor(new Date(time).getTime());
        }
        if (isNaN(current_time)) {
            throw new Error('[error] input time');
        }
        //pluto
        if (conf.option == 3 || conf.option == 4) {
            for (let i = 0; i < schedule.length - 1; i++) {
                if ((schedule[i].end_time < current_time) && (current_time <= schedule[i + 1].end_time)) {
                    if (schedule[i + 1].ad_point.length == 5) {
                        for (let k = 0; k < 5; k++) {
                            if ((schedule[i + 1].ad_point[k].start <= current_time) && (current_time <= schedule[i + 1].ad_point[k].end)) {
                                console.log(new Date(), 'cocos_ad_120s_us is streaming on the', schedule[i + 1].id);
                                running_video.excel.pluto[channel] = "cocos_ad_120s_us";
                                return "cocos_ad_120s_us";
                            }
                        }
                    }
                    console.log(new Date(), schedule[i + 1].id);
                    running_video.excel.pluto[channel] = schedule[i + 1].id;
                    return schedule[i + 1].id;
                }
            }

            if ((conf.start_date <= current_time) && (current_time <= schedule[0].end_time)) {
                // the first video is streaming now
                if (schedule[0].ad_point.length == 5) {
                    for (let k = 0; k < 5; k++) {
                        if ((schedule[0].ad_point[k].start <= current_time) && (current_time <= schedule[0].ad_point[k].end)) {
                            console.log(new Date(), 'cocos_ad_120s_us is streaming on the ', schedule[0].id);
                            running_video.excel.pluto[channel] = 'cocos_ad_120s_us';
                            return "cocos_ad_120s_us";
                        }
                    }
                }
                console.log(new Date(), schedule[0].id);
                running_video.excel.pluto[channel] = schedule[0].id;
                return schedule[0].id;
            }
            else if ((current_time < conf.start_date) || (schedule[schedule.length - 1].end_time < current_time)) {
                throw new Error('[error] start_date or end_time');
            }
            else {
                throw new Error();
            }
        }
        //samsung
        else if (conf.option == 1 || conf.option == 2) {
            for (let i = 0; i < schedule.length - 1; i++) {
                if ((schedule[i].end_time < current_time) && (current_time <= schedule[i + 1].end_time)) {
                    for (let k = 0; k < schedule[i + 1].ad_point.length; k++) {
                        if ((schedule[i + 1].ad_point[k].start <= current_time) && (current_time <= schedule[i + 1].ad_point[k].end)) {
                            console.log(new Date(), 'cocos_ad_60s_20210528_2mbps is streaming on the', schedule[i + 1].id);
                            if (conf.option == 1) running_video.excel.samsung_korea[channel] = 'cocos_ad_60s_20210528_2mbps';
                            if (conf.option == 2) running_video.excel.samsung_northern_america[channel] = 'cocos_ad_60s_us';
                            return "cocos_ad_60s_20210528_2mbps";
                        }
                    }
                    console.log(new Date(), schedule[i + 1].id);
                    if (conf.option == 1) running_video.excel.samsung_korea[channel] = schedule[i + 1].id;
                    if (conf.option == 2) running_video.excel.samsung_northern_america[channel] = schedule[i + 1].id;
                    return schedule[i + 1].id;
                }
            }

            if ((conf.start_date <= current_time) && (current_time <= schedule[0].end_time)) {
                // the first video is streaming now
                for (let k = 0; k < schedule[0].ad_point.length; k++) {
                    if ((schedule[0].ad_point[k].start <= current_time) && (current_time <= schedule[0].ad_point[k].end)) {
                        console.log(new Date(), 'cocos_ad_60s_20210528_2mbps is streaming on the ', schedule[0].id);
                        if (conf.option == 1) running_video.excel.samsung_korea[channel] = 'cocos_ad_60s_20210528_2mbps';
                        if (conf.option == 2) running_video.excel.samsung_northern_america[channel] = 'cocos_ad_60s_us';
                        return "cocos_ad_60s_20210528_2mbps";
                    }
                }
                console.log(new Date(), schedule[0].id);
                if (conf.option == 1) running_video.excel.samsung_korea[channel] = schedule[0].id;
                if (conf.option == 2) running_video.excel.samsung_northern_america[channel] = schedule[0].id;
                return schedule[0].id;
            }
            else if ((current_time < conf.start_date) || (schedule[schedule.length - 1].end_time < current_time)) {
                throw new Error('[error] start_date or end_time');
            }
            else {
                throw new Error();
            }
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

//solrtmp_log == 'test_solrtmp_pluto.log'
let parser_solrtmp_log = (solrtmp_log) => {
    let file = fs.readFileSync(solrtmp_log, 'utf8');
    let full_log = [];
    full_log = file.split('\n');
    let log = {}

    class line {
        constructor(time, video_id) {
            this.time = time;
            this.video_id = video_id;
        }
    }

    let channel_list = [];

    for (let i = 0; i < full_log.length; i++) {
        let index = full_log[i].indexOf(' play=');
        if (index != -1) {
            let time = full_log[i].substr(0, 19);
            let channel_id = full_log[i].substr(full_log[i].indexOf('(id=')).split('/')[0].substr(4);
            if (!(channel_list.includes(channel_id))) {
                channel_list.push(channel_id);
                log[channel_id] = [];
            }
            let video_id = full_log[i].substr(full_log[i].indexOf('(main:')).split('/')[0].substr(6);

            log[channel_id].push(new line(time, video_id));
        }
    }
    return log;
}

//current time = '2022-05-04 00:01:34' 
let id_finder_solrtmp_log = (log, option, time) => {
    try {
        let current_time;
        if (time === undefined) {
            //current time
            current_time = Math.floor(new Date().getTime());
        } else {
            //input time
            current_time = Math.floor(new Date(time).getTime());
        }
        if (isNaN(current_time)) {
            throw new Error('[error] input time');
        }

        for (let x in log) {
            //last line check
            if (fetch_unix_timestamp(log[x][log[x].length - 1].time) <= current_time) {
                console.log(x, log[x][log[x].length - 1].video_id);
                //return log[x][log[x].length-1].video_id;
                if(option==1){ running_video.solrtmp_log.pluto[x]=log[x][log[x].length - 1].video_id;}
                if(option==2){ running_video.solrtmp_log.samsung_korea[x]=log[x][log[x].length - 1].video_id;}
                if(option==3){ running_video.solrtmp_log.samsung_northern_america[x]=log[x][log[x].length - 1].video_id;}
                continue;
            }
            //first line check
            else if (current_time < fetch_unix_timestamp(log[x][0].time)) {
                throw new Error('[error] current time is earlier than the start time of log');
            }
            //middle line check
            for (let i = 0; i < log[x].length - 1; i++) {
                if ((fetch_unix_timestamp(log[x][i].time) <= current_time) && (current_time < fetch_unix_timestamp(log[x][i + 1].time))) {
                    console.log(x, log[x][i].video_id);
                    if(option==1){ running_video.solrtmp_log.pluto[x]=log[x][i].video_id;}
                    if(option==2){ running_video.solrtmp_log.samsung_korea[x]=log[x][log[x].length - 1].video_id;}
                    if(option==3){ running_video.solrtmp_log.samsung_northern_america[x]=log[x][log[x].length - 1].video_id;}
                    //return log[x][i].video_id;
                    continue;
                }
            }
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

let module_excel = () => {
    try {
        let conf = read_conf('configure.conf');
        let schedule = [];
        let excel = xlsx.readFile(conf.file_name);
        let json;
        for (let channel = 0; channel < excel.SheetNames.length; channel++) {
            json = read_excel(excel, conf, channel);
            schedule.push(parser_excel(json, conf));
            id_finder_excel(schedule[channel], conf, channel, '2022-04-01 00:05:00'); //current time = '2022-04-01 00:00:01'
            // setInterval(
            //     () => {
            //       id_finder_excel(schedule[channel], conf, channel);
            //     }, 1000
            // )
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

let file_write = (log, file_name) => {
    for (let x in log) {
        for (let i = 0; i < log[x].length; i++) {
            fs.appendFileSync(file_name, x + ' ' + log[x][i].time + ' ' + log[x][i].video_id + '\n');
        }
    }
}

let print_console = (log) => {
    for (let x in log) {
        for (let i = 0; i < log[x].length; i++) {
            console.log(x + ' ' + log[x][i].time + ' ' + log[x][i].video_id);
        }
    }
}

let module_solrtmp_log = (option) => {
    let log = parser_solrtmp_log('test_solrtmp_samsung.log');
    //let log=parser_solrtmp_log('solrtmp_server_samsung.log');

    id_finder_solrtmp_log(log, option, '2022-04-05 08:55:50'); //current time = '2022-04-05 00:16:35'

    //print_console(log);
    //file_write(log, './workspace/test.log');

}

let main = () => {
    //pluto ==1, samsung==2
    let option=2;

    // module_excel();
    module_solrtmp_log(option);
}

main();

