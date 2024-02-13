import { FC, useEffect, useRef } from 'react';
import 'shaka-player/dist/controls.css';
import shaka from 'shaka-player/dist/shaka-player.ui';

const ShakaPlayerExample: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLElement | null>(null);

  const licenseServer = 'https://widevine-proxy.appspot.com/proxy';
  const manifestUri = 'https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd';
  const videoThumbnail = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Big_Buck_Bunny_thumbnail_vlc.png';

  const subtitles = [
    {
      subtitleUrl: 'https://image.stage.heavenly.tv/vtt/12186439742543826828-20231030044009.vtt',
      languageCode: 'ko',
      type: 'subtitles',
      subtitleType: 'text/vtt',
    },
  ];

  useEffect(() => {
    shaka.polyfill.installAll();
    const player = new shaka.Player(videoRef.current as HTMLVideoElement);

    if (player && videoRef.current && videoContainerRef.current) {
      // if you want to use more ui options
      const uiConfig = {
        overflowMenuButtons: ['captions', 'cast', 'playback_rate', 'language', 'picture_in_picture'],
      };
      const ui = new shaka.ui.Overlay(player, videoContainerRef.current, videoRef.current);
      ui.configure(uiConfig); //configure UI
      ui.getControls();

      player.configure({
        abr: { enabled: true },
        drm: {
          servers: { 'com.widevine.alpha': licenseServer },
        },
      });

      player
        .load(manifestUri)
        .then(function () {
          // This runs if the asynchronous load is successful.
          console.log('The video has now been loaded!');
          //if you want to use subtitle, using  addTextTrackAsync(); this function has to use after load()
          addSubtitleTracks(player);
        })
        .catch(onError); // onError is executed if the asynchronous load fails.
    }
  }, []);

  const addSubtitleTracks = async (player: any) => {
    if (subtitles && subtitles.length > 0) {
      player.setTextTrackVisibility(true);
      player.isTextTrackVisible;
      subtitles.map((row) => {
        player.addTextTrackAsync(row.subtitleUrl, row.languageCode, 'subtitles', 'text/vtt');
      });
    }
  };

  const onError = (error: any) => {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
  };

  return (
    <div
      className="video-container"
      id="video-container"
      style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 1500,
        width: '100%',
        marginTop: 10,
        position: 'relative',
      }}
      //@ts-ignore
      ref={videoContainerRef}
    >
      <video
        ref={videoRef}
        //@ts-ignore
        className="shaka-video"
        id="video"
        controls={false}
        style={{ width: '100%', height: '100%' }} // Added ref attribute
        poster={videoThumbnail}
      />
    </div>
  );
};

export default ShakaPlayerExample;
