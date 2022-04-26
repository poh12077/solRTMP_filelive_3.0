const xlsx = require("xlsx");
//const fs = require('fs');
const fs = require('graceful-fs');

class video_info {
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
            excel: '',
            log: '',
            option: 0,
            start_date: '',
            current_time: '',
            error_tolerance:0,
            cycle:0,
            test:0,

            ad_duration: {
                pluto: '',
                samsung_korea: '',
                samsung_northern_america: ''
            },
            ad_interval: {
                samsung_korea: '',
                samsung_northern_america: ''
            },
            ad_name: {
                pluto: '',
                samsung_korea: '',
                samsung_northern_america: ''
            }
        }

        conf.excel = conf_file.excel;
        conf.log = conf_file.log;
        conf.option = conf_file.option;
        conf.start_date = conf_file.start_date;
        conf.current_time = conf_file.current_time;
        conf.error_tolerance = conf_file.error_tolerance;
        conf.cycle = conf_file.cycle;
        conf.test = conf_file.test;

        // conf.current_time = fetch_unix_timestamp(conf_file.current_time);
        for (let sheet in conf.start_date) {
            conf.start_date[sheet] = fetch_unix_timestamp(conf.start_date[sheet]);
        }

        conf.ad_duration.pluto = conf_file.ad_duration.pluto;
        conf.ad_duration.samsung_korea = conf_file.ad_duration.samsung_korea;
        conf.ad_duration.samsung_northern_america = conf_file.ad_duration.samsung_northern_america;
        conf.ad_interval.samsung_korea = conf_file.ad_interval.samsung_korea;
        conf.ad_interval.samsung_northern_america = conf_file.ad_interval.samsung_northern_america;
        conf.ad_name.pluto = conf_file.ad_name.pluto;
        conf.ad_name.samsung_korea = conf_file.ad_name.samsung_korea;
        conf.ad_name.samsung_northern_america = conf_file.ad_name.samsung_northern_america;

        if (conf.option < 1 || conf.option > 4 || conf.current_time <= 0 || conf.ad_duration.pluto <= 0
            || conf.ad_duration.samsung_korea <= 0 || conf.ad_duration.samsung_northern_america <= 0 || conf.ad_interval.samsung_korea <= 0
            || conf.ad_interval.samsung_northern_america <= 0 || conf.ad_name.pluto.length <= 0 || conf.ad_name.samsung_korea.length <= 0
            || conf.ad_name.samsung_northern_america.length <= 0 || !Number.isInteger(conf.error_tolerance) || conf.cycle <= 0 ) {
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

let parser_excel = (json, conf, sheet) => {
    try {
        let schedule = [];
        let sheet_num = 'sheet_' + sheet.toString();
        let end_time = conf.start_date[sheet_num];
        let ad_list = [];
        let m = conf.start_date[sheet_num];

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

                schedule.push(new video_info(json[i]['id'], end_time, ad_list));
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
let id_finder_excel = (schedule, conf, channel, running_video, current_time) => {
    try {
        //let current_time;
        channel = channel.toString();
        let sheet_num = 'sheet_' + channel;
        // if (conf.current_time === undefined) {
        //     //real time
        //     current_time = Math.floor(new Date().getTime());
        // } else {
        //     //input time
        //     current_time = Math.floor(new Date(conf.current_time).getTime());
        // }
        // if (isNaN(current_time)) {
        //     throw new Error('[error] input time');
        // }

        //pluto
        if (conf.option == 3 || conf.option == 4) {
            for (let i = 0; i < schedule.length - 1; i++) {
                if ((schedule[i].end_time < current_time) && (current_time <= schedule[i + 1].end_time)) {
                    if (schedule[i + 1].ad_point.length == 5) {
                        for (let k = 0; k < 5; k++) {
                            if ((schedule[i + 1].ad_point[k].start <= current_time) && (current_time <= schedule[i + 1].ad_point[k].end)) {
                                //console.log(new Date(), 'cocos_ad_120s_us is streaming on the', schedule[i + 1].id);
                                running_video.excel.pluto[channel] = conf.ad_name.pluto;
                                return "cocos_ad_120s_us";
                            }
                        }
                    }
                    // console.log(new Date(), schedule[i + 1].id);
                    running_video.excel.pluto[channel] = schedule[i + 1].id;
                    return schedule[i + 1].id;
                }
            }

            if ((conf.start_date[sheet_num] <= current_time) && (current_time <= schedule[0].end_time)) {
                // the first video is streaming now
                if (schedule[0].ad_point.length == 5) {
                    for (let k = 0; k < 5; k++) {
                        if ((schedule[0].ad_point[k].start <= current_time) && (current_time <= schedule[0].ad_point[k].end)) {
                            //  console.log(new Date(), 'cocos_ad_120s_us is streaming on the ', schedule[0].id);
                            running_video.excel.pluto[channel] = conf.ad_name.pluto;
                            return "cocos_ad_120s_us";
                        }
                    }
                }
                //console.log(new Date(), schedule[0].id);
                running_video.excel.pluto[channel] = schedule[0].id;
                return schedule[0].id;
            }
            else if ((current_time < conf.start_date[sheet_num]) || (schedule[schedule.length - 1].end_time < current_time)) {
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
                            // console.log(new Date(), 'cocos_ad_60s_20210528_2mbps is streaming on the', schedule[i + 1].id);
                            if (conf.option == 1) running_video.excel.samsung_korea[ mapping_table[channel] ] = conf.ad_name.samsung_korea;
                            if (conf.option == 2) running_video.excel.samsung_northern_america[ mapping_table[channel] ] = conf.ad_name.samsung_northern_america;
                            return "cocos_ad_60s_20210528_2mbps";
                        }
                    }
                    //console.log(new Date(), schedule[i + 1].id);
                    if (conf.option == 1) running_video.excel.samsung_korea[mapping_table[channel]] = schedule[i + 1].id;
                    if (conf.option == 2) running_video.excel.samsung_northern_america[mapping_table[channel]] = schedule[i + 1].id;
                    return schedule[i + 1].id;
                }
            }

            if ((conf.start_date[sheet_num] <= current_time) && (current_time <= schedule[0].end_time)) {
                // the first video is streaming now
                for (let k = 0; k < schedule[0].ad_point.length; k++) {
                    if ((schedule[0].ad_point[k].start <= current_time) && (current_time <= schedule[0].ad_point[k].end)) {
                        //console.log(new Date(), 'cocos_ad_60s_20210528_2mbps is streaming on the ', schedule[0].id);
                        if (conf.option == 1) running_video.excel.samsung_korea[mapping_table[channel]] = conf.ad_name.samsung_korea;
                        if (conf.option == 2) running_video.excel.samsung_northern_america[mapping_table[channel]] = conf.ad_name.samsung_northern_america;
                        return "cocos_ad_60s_20210528_2mbps";
                    }
                }
                //console.log(new Date(), schedule[0].id);
                if (conf.option == 1) running_video.excel.samsung_korea[mapping_table[channel]] = schedule[0].id;
                if (conf.option == 2) running_video.excel.samsung_northern_america[mapping_table[channel]] = schedule[0].id;
                return schedule[0].id;
            }
            else if ((current_time < conf.start_date[sheet_num]) || (schedule[schedule.length - 1].end_time < current_time)) {
                // throw new Error('[error] start_date or end_time');
                return 0;
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
let id_finder_solrtmp_log = (log, conf, running_video, current_time) => {
    try {
        for (let channel in log) {
            //last line check
            if (fetch_unix_timestamp(log[channel][log[channel].length - 1].time) <= current_time) {
                //console.log(channel, log[channel][log[channel].length - 1].video_id);
                if (conf.option == 3) { running_video.solrtmp_log.pluto[channel] = id_cut(log[channel][log[channel].length - 1].video_id, 3); }
                if (conf.option == 1) { running_video.solrtmp_log.samsung_korea[channel] = id_cut(log[channel][log[channel].length - 1].video_id, 2); }
                if (conf.option == 2) { running_video.solrtmp_log.samsung_northern_america[channel] = id_cut(log[channel][log[channel].length - 1].video_id, 2); }
                continue;
            }
            //first line check
            else if (current_time < fetch_unix_timestamp(log[channel][0].time)) {
                throw new Error('[error] current time is earlier than the start time of log');
            }
            //middle line check
            for (let line = 0; line < log[channel].length - 1; line++) {
                if ((fetch_unix_timestamp(log[channel][line].time) <= current_time) && (current_time < fetch_unix_timestamp(log[channel][line + 1].time))) {
                    // console.log(channel, log[channel][line].video_id);
                    if (conf.option == 3) { running_video.solrtmp_log.pluto[channel] = id_cut(log[channel][line].video_id, 3); }
                    if (conf.option == 1) { running_video.solrtmp_log.samsung_korea[channel] = id_cut(log[channel][line].video_id, 2); }
                    if (conf.option == 2) { running_video.solrtmp_log.samsung_northern_america[channel] = id_cut(log[channel][line].video_id, 2); }
                    break;
                }
            }
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

let samsung_smartTV = (json) => {
    try {
        for (let i = 0; i < json.length; i++) {
            if (json[i].id !== undefined) {
                let a = json[i].id.split('_');
                if (a.length != 3) {
                    throw new Error();
                }
                json[i].id = json[i].id.slice(0, -(a[a.length - 1].length + 1));
            }
        }
        return json;
    } catch (err) {
        console.log('[error] samsungTV name parse');
        console.log(err);
        process.exit(1);
    }
}

let module_excel = (running_video, conf) => {
    try {
        let schedule = [];
        //read whole excel
        let excel = xlsx.readFile(conf.excel);
        let json;
        let current_time=[];
        
        //read excel by sheet
        for (let sheet = 0; sheet < excel.SheetNames.length; sheet++) {
            json = read_excel(excel, conf, sheet);
            if (conf.option == 1 || conf.option == 2) {
                json = samsung_smartTV(json);
            }
            schedule.push(parser_excel(json, conf, sheet));
            current_time.push(current_time_finder(conf));
            setInterval(
                () => { 
                    current_time[sheet] = current_time_synchronizer(current_time[sheet], conf.cycle);
                    id_finder_excel(schedule[sheet], conf, sheet, running_video, current_time[sheet] );
                   //streaming_detect(running_video) ;
                }, conf.cycle/conf.test
            )
        }
        return schedule;
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

let id_cut = (id, length) => {
    try {
        let y = id.split('_');
        if (length == 2) {
            return y[y.length - 2] + '_' + y[y.length - 1];
        } else if (length == 3) {
            return y[y.length - 3] + '_' + y[y.length - 2] + '_' + y[y.length - 1];
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}


// let id_cut = (x, conf, type) => {
//     let y = x.split('_');
//     if(conf.option==1 || conf.option==2){
//         if (type == 'log') {
//             return y[y.length - 2] + '_' + y[y.length - 1];
//         }
//         else if (type == 'excel') {
//             return y[0] + '_' + y[1]; 
//         }
//     }
//     else if(conf.option==3 || conf.option ==4){
//         if (type == 'log') {
//             return y[y.length - 3] + '_' + y[y.length - 2] + '_' + y[y.length - 1];
//         }
//         else if (type == 'excel') {
//             return x
//         }
//     } 
// }


let channel_map = (schedule, log, running_video) => {
    let mapping_table = {};
    let break_loop = 0;
    for (let channel in log) {
        for (let excel_sheet = 0; excel_sheet < schedule.length; excel_sheet++) {
            for (let line = 0; line < schedule[excel_sheet].length; line++) {
                if (id_cut(log[channel][0].video_id, 2) == schedule[excel_sheet][line].id) {
                    mapping_table[excel_sheet] = channel;
                    break_loop = 1;
                    break;
                }
            }
            if (break_loop == 1) {
                break_loop = 0;
                break;
            }
        }
    }

    // for (let sheet in running_video.excel.samsung_korea) {
    //     running_video.excel.samsung_korea[mapping_table[sheet]] = running_video.excel.samsung_korea[sheet];
    //     delete running_video.excel.samsung_korea[sheet];
    // }

     return mapping_table;
}

let current_time_finder = (conf) => {
    try {
        if (conf.current_time === undefined) {
            //real time
            return Math.floor(new Date().getTime());
        }

        let unix_current_time = new Date(conf.current_time).getTime();

        if (isNaN(unix_current_time)) {
            throw new Error('[error] input time');
        }
        else {
            //input time
            return unix_current_time;
        }
    } catch (error) {
        console.log(error);
    }
}

let current_time_synchronizer =(current_time, cycle) =>{
    current_time+=cycle;
    return current_time;
}

let module_solrtmp_log = (running_video, conf) => {
    try {
        let log = parser_solrtmp_log(conf.log);
        let current_time = current_time_finder(conf);
        setInterval(
            () => { 
                current_time = current_time_synchronizer(current_time, conf.cycle);
                id_finder_solrtmp_log(log, conf, running_video, current_time); 
                //streaming_detect(running_video);
            }, conf.cycle/conf.test
        )

        //print_console(log);
        //file_write(log, './workspace/test.log');
        return log;
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

let streaming_detect = (running_video, err_count, conf) => {
    try {
        let default_error_tolerance = (10000/conf.cycle)+1;
        for (let channel in running_video.excel.samsung_korea) {
            if (running_video.excel.samsung_korea[channel] === running_video.solrtmp_log.samsung_korea[channel]) {
                err_count[channel]=0;
                console.log(channel, running_video.excel.samsung_korea[channel], running_video.solrtmp_log.samsung_korea[channel], "success");
            } else {
                console.log(channel, running_video.excel.samsung_korea[channel], running_video.solrtmp_log.samsung_korea[channel], "error");
                err_count[channel]++;
                //need to fix
                if( err_count[channel] >= default_error_tolerance + conf.error_tolerance ){
                    console.log(channel, running_video.excel.samsung_korea[channel], running_video.solrtmp_log.samsung_korea[channel], "fail");
                    err_count[channel]=0;    
                }
            }
            //test
            //break;
        }
        console.log('\n');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

// let err_count_init=(schedule)=>{
//     let err_count=[];
//     for(let i=0;i<schedule.length;i++){
//         err_count.push(0);
//     }
//     return err_count;
// } 

let main = () => {
    // let test=1000;
    // let cycle =10000;

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
    try {
        const conf = read_conf('configure.conf');
        const schedule = module_excel(running_video, conf);
        const log = module_solrtmp_log(running_video, conf);
        if (conf.option == 1 || conf.option == 2) {
           mapping_table = channel_map(schedule, log, running_video);
        }
        let err_count={};
        setInterval(() => { 
            streaming_detect(running_video, err_count, conf) 
        }, conf.cycle/conf.test);

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

main();

