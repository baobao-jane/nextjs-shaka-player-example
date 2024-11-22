import { useRouter } from 'next/router';
import { FC, useEffect, useRef, useState } from 'react';
import 'shaka-player/dist/controls.css';
import shaka from 'shaka-player/dist/shaka-player.ui';
import { DrmType, SubtitleRes } from './types/video-type';

const ShakaPlayerExample: FC = () => {
  const router = useRouter();
  const [isSkipButton, setSkipButton] = useState(false);
  // 영상 재생했던 시간
  const [viewSeconds, setViewSeconds] = useState(20);
  // 오프닝 스킵 시간
  const [openingSkipTime, setOpeningSkipTime] = useState(30);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLElement | null>(null);
  const video = videoRef.current;
  const videoContainer = videoContainerRef.current;
  const scrimContainerRef = useRef<HTMLElement | null>(null);
  const shakaSpacerRef = useRef<HTMLElement | null>(null);
  const playerRef = useRef<shaka.Player | null>(null);

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
    if (shaka.Player.isBrowserSupported()) {
      shaka.polyfill.installAll();
      const player = new shaka.Player(videoRef.current as HTMLVideoElement);
      playerRef.current = player;

      checkSupportedDRM().then((drmType) => {
        if (drmType == DrmType.WIDEVINE && player && video && videoContainer) {
          initWidevinePlayer(video as HTMLVideoElement, videoContainer as HTMLElement, player);
        }
      });
    } else {
      // This browser does not have the minimum set of APIs we need
      console.error('Browser not supported!');
    }
  }, []);

  const initWidevinePlayer = async (video: HTMLVideoElement, videoContainer: HTMLElement, player: shaka.Player) => {
    const uiConfig = {
      seekBarColors: {
        base: 'rgba(255, 255, 255, 0.20)',
        buffered: 'rgba(255,255,255,.4)',
        played: '#9DF4FF',
      },
      overflowMenuButtons: ['captions', 'quality', 'playback_rate', 'language'],
    };

    const ui = new shaka.ui.Overlay(player, videoContainer, video);
    ui.configure(uiConfig);

    console.log(']-----[ MediaPlayerTestDialog::initWidevinePlayer WIDEVINE ]-----[');

    player.configure({
      manifest: {
        dash: {
          ignoreEmptyAdaptationSet: true,
        },
      },
      streaming: {
        useNativeHlsOnSafari: true,
      },
      abr: { enabled: true },
      drm: {
        servers: {
          'com.widevine.alpha': licenseServer,
        },
        advanced: {
          'com.widevine.alpha': {
            persistentStateRequired: true,
          },
        },
      },
    });

    player.addEventListener('error', onErrorEvent);
    window.addEventListener('keydown', (event) => {
      if (video) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          video.currentTime -= 5;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          video.currentTime += 5;
        }
        if (event.key === ' ') {
          event.preventDefault();
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }
      }
    });

    // signed cookie 헤더에 추가 방법
    //@ts-ignore
    // player
    //   .getNetworkingEngine()
    //   .registerRequestFilter((type: shaka.net.NetworkingEngine.RequestType, request: shaka.extern.Request) => {
    //     // Only add headers to license requests:
    //     if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
    //       request.headers['Authorization'] = `Bearer ${encodeURIComponent(token!)}`; // Added parentheses to call getIdToken()

    //     }
    //     if (
    //       type == shaka.net.NetworkingEngine.RequestType.SEGMENT ||
    //       type == shaka.net.NetworkingEngine.RequestType.MANIFEST
    //     ) {
    //       // allow cookies to be sent cross-origin
    //       request.allowCrossSiteCredentials = true;
    //     }
    //   });

    //pallycon drm 응답 파싱 방법
    //@ts-ignore
    // player
    //   .getNetworkingEngine()
    //   .registerResponseFilter((type: shaka.net.NetworkingEngine.RequestType, response: shaka.extern.Response) => {
    //     // Alias some utilities provided by the library.
    //     if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
    //       parsingResponse(response);
    //     }
    //   });

    //@ts-ignore
    // player
    //   .getNetworkingEngine()
    //   .registerResponseFilter((type: shaka.net.NetworkingEngine.RequestType, response: shaka.extern.Response) => {
    //     // Alias some utilities provided by the library.
    //     if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
    //       console.log(response.data.byteLength);
    //       let responseText = arrayBufferToString(response.data);
    //       console.log('response : ' + responseText);
    //       if (responseText.indexOf('errorCode') > 0) {
    //         // this alert should be properly parsed and displayed for commercial use
    //         let errorCode = JSON.parse(responseText).errorCode;
    //         if ('8002' != errorCode) {
    //           alert(
    //             'PallyCon Error : ' + JSON.parse(responseText).message + '(' + JSON.parse(responseText).errorCode + ')',
    //           );
    //         } else {
    //           let message = JSON.parse(responseText).message;
    //           alert('Error : ' + JSON.parse(message).MESSAGE + '(' + JSON.parse(message).ERROR + ')');
    //         }
    //       }
    //     }
    //   });

    scrimContainerRef.current = document.querySelector('.shaka-scrim-container') as HTMLElement;
    shakaSpacerRef.current = document.querySelector('.shaka-spacer') as HTMLElement;

    renderTitleAndBackButton();

    try {
      await player.load(manifestUri).then(function () {
        console.log('The video has now been loaded!');
        handleLastViewSeconds();

        if (subtitles && subtitles.length > 0) {
          addSubtitleTracks(player, subtitles);
        }
      });
    } catch (e) {
      onError(e);
      console.log(']-----[ VideoWidevinePlayer::initWidevinePlayer.player.e]-----[', e);
    }
  };

  const addSubtitleTracks = async (player: any, subtitles: SubtitleRes[]) => {
    if (subtitles && subtitles.length > 0) {
      player.setTextTrackVisibility(true);
      player.isTextTrackVisible;
      subtitles.map((row) => {
        player.addTextTrackAsync(row.subtitleUrl, row.languageCode, row.type, row.subtitleType);
      });
    }
  };

  const handleUpdateTime = () => {
    if (!video) return;
    const shouldShowSkipButton = openingSkipTime && video.currentTime < openingSkipTime;
    if (shouldShowSkipButton && !isSkipButton && videoContainer) {
      const openingSkipButton = document.createElement('div');
      openingSkipButton.className = 'player-opening-skip-button';
      openingSkipButton.textContent = '오프닝 건너뛰기';
      videoContainer.appendChild(openingSkipButton);
      openingSkipButton.addEventListener('click', handleOpeningSkipButtonClick);
      setSkipButton(true);
    } else if (!shouldShowSkipButton) {
      handleRemoveOpeningSkipButton();
    }
  };

  const handleRemoveOpeningSkipButton = () => {
    if (videoContainer) {
      const openingSkipButton = videoContainer.querySelector('.player-opening-skip-button');
      if (openingSkipButton) {
        // openingSkipButton.removeEventListener('click', handleOpeningSkipButtonClick);
        openingSkipButton.remove();
      }
      setSkipButton(false);
    }
  };

  const handleOpeningSkipButtonClick = () => {
    if (video && openingSkipTime && openingSkipTime > 0) {
      video.currentTime = openingSkipTime;
      video.play();
      handleRemoveOpeningSkipButton();
    }
  };

  const handleLastViewSeconds = () => {
    if (video && viewSeconds) {
      if (viewSeconds > 0) {
        video.currentTime = viewSeconds;
      }
      video.play();
    }
  };

  const onErrorEvent = function (event: any) {
    // Extract the shaka.util.Error object from the event.
    console.error('Error code', event.detail.code, 'object', event.detail);
    onError(event.detail);
  };

  const onError = (error: any) => {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
  };

  const arrayBufferToString = (buffer: any) => {
    let arr = new Uint8Array(buffer);
    //@ts-ignore
    let str = String.fromCharCode.apply(String, arr);
    return str;
  };

  const checkSupportedDRM = async () => {
    let supportedDRMType = '';
    const config = [
      {
        initDataTypes: ['cenc'],
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
        .requestMediaKeySystemAccess('com.widevine.alpha', config)
        .then((mediaKeySystemAccess) => {
          //@ts-ignore
          supportedDRMType = DrmType.WIDEVINE;
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
    return supportedDRMType;
  };

  const renderTitleAndBackButton = () => {
    if (scrimContainerRef.current) {
      const backButton = document.createElement('img');
      backButton.className = 'player-back-button';
      backButton.src = '/images/icons/icon_arrow_back.svg';
      scrimContainerRef.current.appendChild(backButton);
      backButton.addEventListener('click', () => {
        router.push(`/`);
      });
    }
    if (shakaSpacerRef.current) {
      const episodeTitleText = document.createElement('div');
      episodeTitleText.className = 'shaka-episode-title';
      episodeTitleText.textContent = 'Episode 1';
      shakaSpacerRef.current.appendChild(episodeTitleText);
    }
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
        className="shaka-video"
        id="video"
        controls={false}
        style={{ width: '100%', height: '100%' }} // Added ref attribute
        poster={videoThumbnail}
        onTimeUpdate={handleUpdateTime}
      />
    </div>
  );
};

export default ShakaPlayerExample;
