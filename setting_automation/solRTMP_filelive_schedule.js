const xlsx = require("xlsx");
var fs = require('fs');
const { exit } = require("process");

let read_conf = (conf_name) => {
  try {
    let data = fs.readFileSync(conf_name, 'utf8');
    data = JSON.parse(data);
    let file_name = data.file_name;

    option = data.option;
    ad_interval_korea = data.ad_interval.samsung_korea;
    ad_interval_northern_america = data.ad_interval.samsung_northern_america;
    ad_duration_samsung_korea = data.ad_duration.samsung_korea;
    ad_duration_samsung_northern_america = data.ad_duration.samsung_northern_america;
    ad_duration_pluto = data.ad_duration.pluto;
    CJENM_leaderfilm_duration = data.CJENM_leaderfilm_duration;
    start_date = data.start_date;

    if (option < 1 || option > 4 || ad_interval_korea <= 0 || ad_interval_northern_america <= 0
      || ad_duration_samsung_korea <= 0 || ad_duration_samsung_northern_america <= 0 || ad_duration_pluto <= 0
      || CJENM_leaderfilm_duration <= 0) {
      throw new Error("[error] configure value");
    }

    return file_name;
  } catch (error) {
    console.log('[error] configure.conf');
    console.log(error);
    process.exit(1);
  }
}

let read_excel = (excel, i) => {
  try {
    const sheet_name = excel.SheetNames[i];
    const sheet_data = excel.Sheets[sheet_name];

    if (option == 3 || option == 4) {
      if ((sheet_data.E1.v != 'Ad Point 1') || (sheet_data.F1.v != 'Ad Point 2')
        || (sheet_data.G1.v != 'Ad Point 3') || (sheet_data.H1.v != 'Ad Point 4')
        || (sheet_data.I1.v != 'Ad Point 5')) {
        throw new Error('[error] excel Ad Point title');
      }
    }
    let json = xlsx.utils.sheet_to_json(sheet_data);
    return json;
  } catch (error) {
    console.log('[error] excel read ');
    console.log(error);
    process.exit(1);
  }
}

class templete {
  constructor(x) {
    let schedule_samsung =
    {
      "server_id": "manager_1234",
      "command": "ch_add",
      "channel": {
        "id": "ch_id",
        "version": "v1",
        "category": "live",
        "input": {
          "type": "schedule",
          "socket_timeout": 3,
          "reconnect_timeout": 300,
          "streams": [
            {
              "adaptive_id": "1080p",
              "variant": true,
              "urls": [
                "file:///stg/solrtmp/file/default_1080p.mp4"
              ]
            },
            {
              "adaptive_id": "720p",
              "variant": true,
              "urls": [
                "file:///stg/solrtmp/file/default_720p.mp4"
              ]
            },
            {
              "adaptive_id": "480p",
              "variant": true,
              "urls": [
                "file:///stg/solrtmp/file/default_480p.mp4"
              ]
            },
            {
              "adaptive_id": "360p",
              "variant": true,
              "urls": [
                "file:///stg/solrtmp/file/default_360p.mp4"
              ]
            },
            {
              "adaptive_id": "270p",
              "variant": true,
              "urls": [
                "file:///stg/solrtmp/file/default_270p.mp4"
              ]
            }
          ]
        },
        "schedule": {
          "loop": true,
          "sync_timeout": 2,
          "range_start_by": "front",
          "auto_adaptive_mapping": "media",
          "list": [
          ]
        },
        "output": {
          "base_dir": "%r/%s",
          "clear_when_finish": true,
          "segment_opt": {
            "playlist_chunk_count": 10,
            "max_chunk_count": 30,
            "duration_time": 6,
            "align_by_src": true
          },
          "variant": {
            "memory_caching": false,
            "sort_order": "bandwidth",
            "item": {
              "codec": true,
              "bandwidth": true,
              "resolution": true,
              "framerate": true,
              "sar": false,
              "samplerate": false,
              "channel": false,
              "lang": true
            },
            "output_path": [
              {
                "o_type": "gateway_m3u8",
                "combine": "%f/playlist.m3u8"
              },
              {
                "o_type": "mpd",
                "combine": "%f/manifest.mpd"
              }
            ]
          },
          "hls": {
            "ad_marker": "scte35enh",
            "memory_caching": false,
            "start_sequence_num": 0,
            "hls_version": 3,
            "output_path": [
              {
                "o_type": "m3u8",
                "combine": "%f/%a/chunklist.m3u8"
              },
              {
                "o_type": "gateway_m3u8",
                "combine": "%f/%a/playlist.m3u8"
              },
              {
                "o_type": "ts_segment",
                "combine": "%f/%a/segment_%n.ts"
              }
            ]
          }
        }
      }
    }

    let schedule_pluto =
    {
      "server_id": "manager_1234",
      "command": "ch_add",
      "channel": {
        "id": "2c56c2b9_aa3a_409e_a99b_37b01a746233",
        "version": "v1",
        "category": "live",
        "input": {
          "type": "schedule",
          "socket_timeout": 3,
          "reconnect_timeout": 300,
          "streams": [
            {
              "adaptive_id": "1080p",
              "variant": true,
              "urls": [
                "file:///usr/service/stg/solrtmp/file/default_1080p.mp4"
              ]
            },
            {
              "adaptive_id": "720p",
              "variant": true,
              "urls": [
                "file:///usr/service/stg/solrtmp/file/default_720p.mp4"
              ]
            },
            {
              "adaptive_id": "480p",
              "variant": true,
              "urls": [
                "file:///usr/service/stg/solrtmp/file/default_480p.mp4"
              ]
            },
            {
              "adaptive_id": "360p",
              "variant": true,
              "urls": [
                "file:///usr/service/stg/solrtmp/file/default_360p.mp4"
              ]
            },
            {
              "adaptive_id": "270p",
              "variant": true,
              "urls": [
                "file:///usr/service/stg/solrtmp/file/default_270p.mp4"
              ]
            }
          ],
          "subs": [
            {
              "name": "english",
              "lang": "eng",
              "default": true
            }
          ]
        },
        "schedule": {
          "loop": true,
          "sync_timeout": 2,
          "range_start_by": "front",
          "auto_adaptive_mapping": "media",
          "list": []
        },
        "output": {
          "base_dir": "%r/%s",
          "clear_when_finish": true,
          "segment_opt": {
            "playlist_chunk_count": 10,
            "max_chunk_count": 30,
            "duration_time": 6,
            "align_by_src": true
          },
          "variant": {
            "memory_caching": false,
            "sort_order": "bandwidth",
            "item": {
              "codec": true,
              "bandwidth": true,
              "resolution": true,
              "framerate": true,
              "sar": false,
              "samplerate": false,
              "channel": false,
              "lang": true
            },
            "output_path": [
              {
                "o_type": "gateway_m3u8",
                "combine": "%f/playlist.m3u8"
              },
              {
                "o_type": "mpd",
                "combine": "%f/manifest.mpd"
              }
            ]
          },
          "hls": {
            "ad_marker": "scte35all",
            "subtitle": "cea708",
            "memory_caching": false,
            "start_sequence_num": 0,
            "hls_version": 3,
            "output_path": [
              {
                "o_type": "m3u8",
                "combine": "%f/%a/chunklist.m3u8"
              },
              {
                "o_type": "gateway_m3u8",
                "combine": "%f/%a/playlist.m3u8"
              },
              {
                "o_type": "ts_segment",
                "combine": "%f/%a/segment_%n.ts"
              }
            ],
            "cmaf": {
              "enable": false,
              "support_relay": false,
              "chunk_interval": 500
            },
            "drm": {
              "encryption_type": "none",
              "key_info": [
                {
                  "name": "key",
                  "value": "31323334353637383930616263646566"
                }
              ],
              "ro_server": [
                {
                  "ro_type": "normal",
                  "version": "1",
                  "url": "http://localhost:8080/test.key",
                  "provider": "SolBox Inc."
                }
              ]
            }
          }
        }
      }
    }

    let schedule_pluto_1080p =
    {
      "server_id": "manager_1234",
      "command": "ch_add",
      "channel": {
        "id": "2c56c2b9_aa3a_409e_a99b_37b01a746233",
        "version": "v1",
        "category": "live",
        "input": {
          "type": "schedule",
          "socket_timeout": 3,
          "reconnect_timeout": 300,
          "streams": [
            {
              "adaptive_id": "1080p",
              "variant": true,
              "urls": [
                "file:///usr/service/stg/solrtmp/file/default_1080p.mp4"
              ]
            },
          ],
          "subs": [
            {
              "name": "english",
              "lang": "eng",
              "default": true
            }
          ]
        },
        "schedule": {
          "loop": true,
          "sync_timeout": 2,
          "range_start_by": "front",
          "auto_adaptive_mapping": "media",
          "list": []
        },
        "output": {
          "base_dir": "%r/%s",
          "clear_when_finish": true,
          "segment_opt": {
            "playlist_chunk_count": 10,
            "max_chunk_count": 30,
            "duration_time": 6,
            "align_by_src": true
          },
          "variant": {
            "memory_caching": false,
            "sort_order": "bandwidth",
            "item": {
              "codec": true,
              "bandwidth": true,
              "resolution": true,
              "framerate": true,
              "sar": false,
              "samplerate": false,
              "channel": false,
              "lang": true
            },
            "output_path": [
              {
                "o_type": "gateway_m3u8",
                "combine": "%f/playlist.m3u8"
              },
              {
                "o_type": "mpd",
                "combine": "%f/manifest.mpd"
              }
            ]
          },
          "hls": {
            "ad_marker": "scte35all",
            "subtitle": "cea708",
            "memory_caching": false,
            "start_sequence_num": 0,
            "hls_version": 3,
            "output_path": [
              {
                "o_type": "m3u8",
                "combine": "%f/%a/chunklist.m3u8"
              },
              {
                "o_type": "gateway_m3u8",
                "combine": "%f/%a/playlist.m3u8"
              },
              {
                "o_type": "ts_segment",
                "combine": "%f/%a/segment_%n.ts"
              }
            ],
            "cmaf": {
              "enable": false,
              "support_relay": false,
              "chunk_interval": 500
            },
            "drm": {
              "encryption_type": "none",
              "key_info": [
                {
                  "name": "key",
                  "value": "31323334353637383930616263646566"
                }
              ],
              "ro_server": [
                {
                  "ro_type": "normal",
                  "version": "1",
                  "url": "http://localhost:8080/test.key",
                  "provider": "SolBox Inc."
                }
              ]
            }
          }
        }
      }
    }

    if (x == 'samsung') {
      return schedule_samsung;
    }
    else if (x == 'pluto') {
      return schedule_pluto;
    }
    else if (x == 'pluto_1080p') {
      return schedule_pluto_1080p;
    }
  }
}

let time_converter = (x) => {
  try {
    if (typeof (x) === 'string') {
      if (isNaN(Number(x))) {
        y = x.split(':');
        if (y.length != 3) {
          throw new Error();
        }
        time = (parseInt(y[0]) * 3600 + parseInt(y[1]) * 60 + parseInt(y[2])) * 1000;
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

let write_json_samsungTV_domestic = (json, k, file_name) => {
  try {
    let n = 1;
    let schedule = new templete('samsung');

    for (let i = 0; i < json.length; i++) {
      if (json[i]['id'] != undefined) {
        if (n == 1) {
          let video =
          {
            "start_date": start_date,
            "id": "schid_" + n.toString() + "_1",
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": 0,
              "end": ad_interval_korea
            }
          }
          schedule.channel.schedule.list.push(video);
        }
        else {
          let video =
          {
            "id": "schid_" + n.toString() + "_1",
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": 0,
              "end": ad_interval_korea
            }
          }
          schedule.channel.schedule.list.push(video);
        }

        let advertisement =
        {
          "id": "schid_ad_" + n.toString() + "_1",
          "ch_id": "cocos_ad_60s_20210528_2mbps",
          "range":
          {
            "start": 0,
            "end": ad_duration_samsung_korea
          }
        }
        schedule.channel.schedule.list.push(advertisement);

        let m;
        for (let j = 1; j > 0; j++) {
          if (json[i]['__EMPTY'] <= ad_interval_korea * (j + 1)) {
            m = j;
            break;
          }

          let video =
          {
            "id": "schid_" + n.toString() + "_" + (j + 1).toString(),
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": ad_interval_korea * j,
              "end": ad_interval_korea * (j + 1)
            }
          }

          if (time_converter(video.range.start) >= time_converter(video.range.end)) {
            console.log('[error] start == end ');
            process.exit(1);
          }

          let advertisement =
          {
            "id": "schid_ad_" + n.toString() + "_" + (j + 1).toString(),
            "ch_id": "cocos_ad_60s_20210528_2mbps",
            "range":
            {
              "start": 0,
              "end": ad_duration_samsung_korea
            }
          }
          schedule.channel.schedule.list.push(video);
          schedule.channel.schedule.list.push(advertisement);
        }

        let video =
        {
          "id": "schid_" + n.toString() + "_" + (m + 1).toString(),
          "ch_id": "cocos_program_" + json[i].id,
          "range":
          {
            "start": ad_interval_korea * m,
            "end": json[i]['__EMPTY'],
          }
        }

        if (time_converter(video.range.start) >= time_converter(video.range.end)) {
          console.log('[error] start == end ');
          process.exit(1);
        }

        schedule.channel.schedule.list.push(video);
        n++;
      }
    }
    n = 1;
    file_name = file_name.split('.')[0];
    file_name = '202204_' + file_name + '_' + k.toString() + '.json';
    let file_json = JSON.stringify(schedule, null, "\t");
    fs.writeFile('./json/' + file_name, file_json, function (err) {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log('[error] samsungTV domestic write');
    console.log(err);
    process.exit(1);
  }
}

let write_json_samsungTV_northern_america = (json, file_name) => {
  try {
    let n = 1;
    let schedule = new templete('samsung');

    for (let i = 0; i < json.length; i++) {
      if (json[i]['id'] != undefined) {

        if (n == 1) {
          let video =
          {
            "start_date": start_date,
            "id": "schid_" + n.toString() + "_1",
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": 0,
              "end": ad_interval_northern_america
            }
          }
          schedule.channel.schedule.list.push(video);
        }
        else {
          let video =
          {
            "id": "schid_" + n.toString() + "_1",
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": 0,
              "end": ad_interval_northern_america
            }
          }
          schedule.channel.schedule.list.push(video);
        }

        let advertisement =
        {
          "id": "schid_ad_" + n.toString() + "_1",
          "ch_id": "cocos_ad_60s_us",
          "range":
          {
            "start": 0,
            "end": ad_duration_samsung_northern_america
          }
        }
        schedule.channel.schedule.list.push(advertisement);

        let m;
        for (let j = 1; j > 0; j++) {
          if (json[i]['__EMPTY'] <= ad_interval_northern_america * (j + 1)) {
            m = j;
            break;
          }

          let video =
          {
            "id": "schid_" + n.toString() + "_" + (j + 1).toString(),
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": ad_interval_northern_america * j,
              "end": ad_interval_northern_america * (j + 1)
            }
          }
          if (time_converter(video.range.start) >= time_converter(video.range.end)) {
            console.log('[error] start == end ');
            process.exit(1);
          }

          let advertisement =
          {
            "id": "schid_ad_" + n.toString() + "_" + (j + 1).toString(),
            "ch_id": "cocos_ad_60s_us",
            "range":
            {
              "start": 0,
              "end": ad_duration_samsung_northern_america
            }
          }
          schedule.channel.schedule.list.push(video);
          schedule.channel.schedule.list.push(advertisement);
        }

        let video =
        {
          "id": "schid_" + n.toString() + "_" + (m + 1).toString(),
          "ch_id": "cocos_program_" + json[i].id,
          "range":
          {
            "start": ad_interval_northern_america * m,
            "end": json[i]['__EMPTY'],
          }
        }

        if (time_converter(video.range.start) >= time_converter(video.range.end)) {
          console.log('[error] start == end ');
          process.exit(1);
        }

        schedule.channel.schedule.list.push(video);
        n++;
      }
    }

    n = 1;
    file_name = file_name.split('.')[0];
    file_name = '202204_' + file_name + '.json';
    let file_json = JSON.stringify(schedule, null, "\t");
    fs.writeFile('./json/' + file_name, file_json, function (err) {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log('[error] samsungTV north america write');
    console.log(err);
    process.exit(1);
  }
}

let write_json_plutoTV = (json, file_name) => {
  try {
    n = 1;
    let schedule = new templete('pluto');

    for (let i = 0; i < json.length; i++) {
      if (json[i]['id'] != undefined) {
        if (json[i]['__EMPTY'] == CJENM_leaderfilm_duration) {
          if (n == 1) {
            let video =
            {
              "start_date": start_date,
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['__EMPTY']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            schedule.channel.schedule.list.push(video);
            n++;
          }
          else {
            let video =
            {
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['__EMPTY']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            schedule.channel.schedule.list.push(video);
            n++;
          }
        }
        else {
          if (n == 1) {
            let video =
            {
              "start_date": start_date,
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['Ad Point 1']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            schedule.channel.schedule.list.push(video);
          }
          else {
            let video =
            {
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['Ad Point 1']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }
            schedule.channel.schedule.list.push(video);
          }

          let advertisement =
          {
            "id": "schid_ad_" + n.toString() + "_1",
            "ch_id": "cocos_ad_120s_us",
            "range":
            {
              "start": 0,
              "end": ad_duration_pluto
            }
          }
          schedule.channel.schedule.list.push(advertisement);

          for (let j = 1; j < 5; j++) {
            let video =
            {
              "id": "schid_" + n.toString() + "_" + (j + 1).toString(),
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": time_converter(json[i]['Ad Point ' + j.toString()]),
                "end": time_converter(json[i]['Ad Point ' + (j + 1).toString()]),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            let advertisement =
            {
              "id": "schid_ad_" + n.toString() + "_" + (j + 1).toString(),
              "ch_id": "cocos_ad_120s_us",
              "range":
              {
                "start": 0,
                "end": ad_duration_pluto
              }
            }
            schedule.channel.schedule.list.push(video);
            schedule.channel.schedule.list.push(advertisement);
          }

          let video =
          {
            "id": "schid_" + n.toString() + "_6",
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": time_converter(json[i]['Ad Point 5']),
              "end": json[i]['__EMPTY'],
            }
          }

          if (time_converter(video.range.start) >= time_converter(video.range.end)) {
            console.log('[error] start == end ');
            process.exit(1);
          }

          schedule.channel.schedule.list.push(video);
          n++;
        }
      }
    }
    n = 1;
    file_name = file_name.split('.')[0];
    file_name = '202204_' + file_name + '.json';
    let file_json = JSON.stringify(schedule, null, "\t");
    fs.writeFile('./json/' + file_name, file_json, function (err) {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log('[error] plutoTV write');
    console.log(err);
    process.exit(1);
  }
}

let write_json_plutoTV_1080p = (json, file_name) => {
  try {
    n = 1;
    let schedule = new templete('pluto_1080p');

    for (let i = 0; i < json.length; i++) {
      if (json[i]['id'] != undefined) {
        if (json[i]['__EMPTY'] == CJENM_leaderfilm_duration) {
          if (n == 1) {
            let video =
            {
              "start_date": start_date,
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['__EMPTY']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            schedule.channel.schedule.list.push(video);
            n++;
          }
          else {
            let video =
            {
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['__EMPTY']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            schedule.channel.schedule.list.push(video);
            n++;
          }
        }
        else {
          if (n == 1) {
            let video =
            {
              "start_date": start_date,
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['Ad Point 1']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            schedule.channel.schedule.list.push(video);
          }
          else {
            let video =
            {
              "id": "schid_" + n.toString() + "_1",
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": 0,
                "end": time_converter(json[i]['Ad Point 1']),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            schedule.channel.schedule.list.push(video);
          }

          let advertisement =
          {
            "id": "schid_ad_" + n.toString() + "_1",
            "ch_id": "cocos_ad_120s_us",
            "range":
            {
              "start": 0,
              "end": ad_duration_pluto
            }
          }
          schedule.channel.schedule.list.push(advertisement);

          for (let j = 1; j < 5; j++) {
            let video =
            {
              "id": "schid_" + n.toString() + "_" + (j + 1).toString(),
              "ch_id": "cocos_program_" + json[i].id,
              "range":
              {
                "start": time_converter(json[i]['Ad Point ' + j.toString()]),
                "end": time_converter(json[i]['Ad Point ' + (j + 1).toString()]),
              }
            }

            if (time_converter(video.range.start) >= time_converter(video.range.end)) {
              console.log('[error] start == end ');
              process.exit(1);
            }

            let advertisement =
            {
              "id": "schid_ad_" + n.toString() + "_" + (j + 1).toString(),
              "ch_id": "cocos_ad_120s_us",
              "range":
              {
                "start": 0,
                "end": ad_duration_pluto
              }
            }
            schedule.channel.schedule.list.push(video);
            schedule.channel.schedule.list.push(advertisement);
          }

          let video =
          {
            "id": "schid_" + n.toString() + "_6",
            "ch_id": "cocos_program_" + json[i].id,
            "range":
            {
              "start": time_converter(json[i]['Ad Point 5']),
              "end": json[i]['__EMPTY'],
            }
          }
          if (time_converter(video.range.start) >= time_converter(video.range.end)) {
            console.log('[error] start == end ');
            process.exit(1);
          }
          schedule.channel.schedule.list.push(video);
          n++;
        }
      }
    }
    n = 1;
    file_name = file_name.split('.')[0];
    file_name = '202204_' + file_name + '_1080p' + '.json';
    let file_json = JSON.stringify(schedule, null, "\t");
    fs.writeFile('./json/' + file_name, file_json, function (err) {
      if (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log('[error] plutoTV 1080p write');
    console.log(err);
    process.exit(1);
  }
}

let verify = (json) => {
  try {
    if (json.length <= 0) {
      throw new Error();
    }

    for (let i = 1; i < json.length; i++) {
      if (!(json[i]['__EMPTY'] > 0 && json[i]['id'].length > 0)) {
        throw new Error();
      }
    }
    return json;
  } catch (err) {
    console.log('[error] excel parse');
    console.log(err);
    process.exit(1);
  }
}

let main = () => {
  try {
    let file_name = read_conf('configure.conf');
    let excel = xlsx.readFile(file_name);
    let json;

    for (let k = 0; k < excel.SheetNames.length; k++) {
      json = read_excel(excel, k);

      if (option == 1) {
        json = samsung_smartTV(json);
        json = verify(json);
        write_json_samsungTV_domestic(json, k, file_name);
      }
      else if (option == 2) {
        json = samsung_smartTV(json);
        json = verify(json);
        write_json_samsungTV_northern_america(json, file_name);
      }
      else if (option == 3) {
        json = verify(json);
        write_json_plutoTV(json, file_name);
      }
      else if (option == 4) {
        json = verify(json);
        write_json_plutoTV_1080p(json, file_name);
      }
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

main();


