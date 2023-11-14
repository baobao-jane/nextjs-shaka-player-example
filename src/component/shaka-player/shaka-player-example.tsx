import { FC, useEffect, useRef } from 'react';
import 'shaka-player/dist/controls.css';
import shaka from 'shaka-player/dist/shaka-player.ui';

const ShakaPlayerExample: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLElement | null>(null);

  const licenseServer = 'https://widevine-proxy.appspot.com/proxy';
  const manifestUri = 'https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd';
  const videoThumbnail = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Big_Buck_Bunny_thumbnail_vlc.png';

  useEffect(() => {
    shaka.polyfill.installAll();
    const player = new shaka.Player(videoRef.current as HTMLVideoElement);

    if (player) {
      new shaka.ui.Overlay(
        player,
        videoContainerRef.current as HTMLElement,
        videoRef.current as HTMLVideoElement,
      ).getControls();

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
        })
        .catch(onError); // onError is executed if the asynchronous load fails.
    }
  }, []);

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
        style={{ width: '100%', height: '100%' }} // Added ref attribute
        poster={videoThumbnail}
      />
    </div>
  );
};

export default ShakaPlayerExample;
