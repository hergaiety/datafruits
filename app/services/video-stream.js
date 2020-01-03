import Service from '@ember/service';
import { later, run } from '@ember/runloop';
import ENV from "datafruits13/config/environment";
import fetch from 'fetch';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.set('streamHost', ENV.STREAM_HOST);
    this.set('streamName', ENV.STREAM_NAME);
  },

  active: false,

  initializePlayer: async function() {
    const module = await import("video.js");
    const videojs = module.default;
    let name = this.streamName;
    let extension = this.extension;
    run(() => {
      let type;
      let host = this.streamHost;
      let streamUrl = `${host}/hls/${name}.${extension}`;
      if (extension == "mp4") {
        type = "video/mp4";
      }
      else if (extension == "m3u8") {
        type = "application/x-mpegURL";
      }
      else {
        console.log("Unknown extension: " + extension); // eslint-disable-line no-console
        this.set("active", false);
        return;
      }

      let preview = name;

      let player = videojs('video-player', {
        poster: `previews/${preview}.png`

      });

      console.log(streamUrl); // eslint-disable-line no-console
      player.src({
        src: streamUrl,
        type: type
      });



      player.play();
    });

  },

  streamIsActive(name, extension){
    this.set("active", true);
    this.set('streamName', name);
    this.set('extension', extension);
  },

  fetchStream(){
    let name = this.streamName;
    let host = this.streamHost;
    fetch(`${host}/hls/${name}.m3u8`, {method:'HEAD'}).then((response) => {
      if (response.status == 200) {
        this.streamIsActive(`${name}`, "m3u8");
      } else {
        //no m3u8 exists, try vod file

        fetch(`${host}/hls/${name}.mp4`, {method:'HEAD'}).then((response) => {
          if (response.status == 200) {
            //mp4 exists, play it
            this.streamIsActive(name, "mp4");
          } else {
            console.log("No stream found"); // eslint-disable-line no-console
            later(()=> {
              this.fetchStream();
            }, 15000);
          }
        }).catch(function(err) {
          console.log("Error: " + err); // eslint-disable-line no-console
        });
      }

    }).catch(function(err) {
      console.log("Error: " + err); // eslint-disable-line no-console
    });
  },
});