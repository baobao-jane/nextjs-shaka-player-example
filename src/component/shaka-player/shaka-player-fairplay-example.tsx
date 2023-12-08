import { FC, useEffect, useRef } from 'react';
import 'shaka-player/dist/controls.css';
import shaka from 'shaka-player/dist/shaka-player.ui';

const ShakaPlayerFairPlayExample: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLElement | null>(null);

  const licenseServer = 'YOUR_LICENSE_SERVER';
  const manifestUri = 'https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd';
  const videoThumbnail = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Big_Buck_Bunny_thumbnail_vlc.png';
  const fairplayCertUri = 'YOUR_FAIRPLAY_CERT_URI'; // for base64 encoded binary cert data
  const fairplayCertDerUri = 'YOUR_FAIRPLAY_CERT_DER_URI'; // for cert .der file download

  useEffect(() => {
    shaka.polyfill.installAll();
    shaka.polyfill.PatchedMediaKeysApple.install();
    const player = new shaka.Player(videoRef.current as HTMLVideoElement);
    checkSupportedDRM().then(function () {
      initPlayer(player, videoRef.current as HTMLVideoElement, videoContainerRef.current as HTMLElement);
    });
  }, []);

  const initPlayer = async (player: shaka.Player, video: HTMLVideoElement, videoContainer: HTMLElement) => {
    // if you want to use more ui options
    const uiConfig = {
      overflowMenuButtons: ['captions', 'airplay', 'playback_rate', 'language', 'picture_in_picture'],
    };
    const ui = new shaka.ui.Overlay(player, videoContainer, video);
    ui.configure(uiConfig); //configure UI
    ui.getControls();

    const fairplayCert = getFairplayCert();

    player.configure({
      abr: { enabled: true },
      drm: {
        servers: {
          'com.apple.fps': licenseServer,
        },
        advanced: {
          'com.apple.fps': {
            serverCertificate: fairplayCert,
          },
        },
      },
      streaming: {
        useNativeHlsOnSafari: true,
      },
    });

    //@ts-ignore
    player.getNetworkingEngine().registerRequestFilter(function (type, request) {
      if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
        //@ts-ignore
        const originalPayload = new Uint8Array(request.body);
        const base64Payload = shaka.util.Uint8ArrayUtils.toBase64(originalPayload);
        const params = 'spc=' + encodeURIComponent(base64Payload);
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        request.body = shaka.util.StringUtils.toUTF8(params);
      } else if (
        type == shaka.net.NetworkingEngine.RequestType.MANIFEST ||
        type == shaka.net.NetworkingEngine.RequestType.SEGMENT
      ) {
        // allow cookies to be sent cross-origin
        request.allowCrossSiteCredentials = true;
      } else {
        return;
      }
    });

    //@ts-ignore
    player.getNetworkingEngine().registerResponseFilter((type, response) => {
      if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
        let responseText = shaka.util.StringUtils.fromUTF8(response.data);
        // Trim whitespace.
        responseText = responseText.trim();
        // Look for <ckc> wrapper and remove it.
        if (responseText.substr(0, 5) === '<ckc>' && responseText.substr(-6) === '</ckc>') {
          responseText = responseText.slice(5, -6);
        }
        // Decode the base64-encoded data into the format the browser expects.
        response.data = shaka.util.Uint8ArrayUtils.fromBase64(responseText).buffer;
      }
    });

    await player
      .load(manifestUri)
      .then(function () {
        // This runs if the asynchronous load is successful.
        console.log('The video has now been loaded!');

        //if you want to use subtitle, using  addTextTrackAsync(); this function has to use after load()
        player.addTextTrackAsync('your subtitle url', 'your subtitle language', 'subtitle', 'text/vtt');
      })
      .catch(onError); // onError is executed if the asynchronous load fails.
  };

  const checkSupportedDRM = async () => {
    let supportedDRMType = '';
    const config = [
      {
        initDataTypes: ['cenc', 'sinf', 'skd'],
        audioCapabilities: [
          {
            contentType: 'audio/mp4;codecs="mp4a.40.2"',
          },
        ],
        videoCapabilities: [
          {
            contentType: 'video/mp4;codecs="avc1.42E01E"',
          },
          {
            contentType: 'video/mp4;codecs="avc1.640028"',
          },
          {
            contentType: 'video/mp4;codecs="avc1.4d401f"',
          },
        ],
      },
    ];
    try {
      await navigator
        //@ts-ignore
        .requestMediaKeySystemAccess('com.apple.fps', config)
        .then((mediaKeySystemAccess) => {
          //@ts-ignore
          supportedDRMType = DrmType.FAIRPLAY;
          console.log(supportedDRMType + ' support ok');
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const getFairplayCert = () => {
    var xmlhttp;
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else {
      //@ts-ignore
      xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xmlhttp.open('GET', fairplayCertUri, false);
    xmlhttp.send();

    var fpsCert = shaka.util.Uint8ArrayUtils.fromBase64(xmlhttp.responseText);
    return fpsCert;
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
        style={{ width: '100%', height: '100%' }} // Added ref attribute
        poster={videoThumbnail}
      />
    </div>
  );
};

export default ShakaPlayerFairPlayExample;
