import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";

interface DriveVideoPlayerProps {
  driveUrl: string;
}

const extractDriveId = (url: string): string | null => {
  const match = url.match(/\/file\/d\/([^/]+)/);
  return match ? match[1] : null;
};

const DriveVideoPlayer: React.FC<DriveVideoPlayerProps> = ({ driveUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const driveId = useMemo(() => extractDriveId(driveUrl), [driveUrl]);

  const htmlContent = useMemo(() => {
    if (!driveId) return "";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
          <meta name="mobile-web-app-capable" content="yes">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body, html {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background-color: #000;
              overflow: hidden;
              position: fixed;
              touch-action: manipulation;
              -webkit-overflow-scrolling: touch;
            }
            #player-container {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
              left: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #000;
              pointer-events: none;
            }
            #player-container iframe {
              pointer-events: auto;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              display: block;
              position: absolute;
              top: 0;
              left: 0;
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
              pointer-events: auto;
              z-index: 1;
            }
          </style>
        </head>
        <body>
          <div id="player-container">
            <iframe
              id="drive-player"
              src="https://drive.google.com/file/d/${driveId}/preview?usp=sharing&rm=minimal&autoplay=1"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowfullscreen
              webkitallowfullscreen
              mozallowfullscreen
              scrolling="no"
              frameborder="0"
              gesture="media"
              allowtransparency="true"
              style="pointer-events: auto;"
            ></iframe>
          </div>
          <script>
            (function() {
              const iframe = document.getElementById('drive-player');
              
              // Ensure iframe is properly sized and interactive
              function setupPlayer() {
                if (iframe) {
                  iframe.style.width = '100%';
                  iframe.style.height = '100%';
                  iframe.style.pointerEvents = 'auto';
                  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
                }
              }
              
              // Setup immediately
              setupPlayer();
              
              // Also setup on load
              window.addEventListener('load', setupPlayer);
              iframe.addEventListener('load', function() {
                // After iframe loads, ensure it's fully interactive
                setTimeout(function() {
                  iframe.style.pointerEvents = 'auto';
                  // Simulate a click on the iframe to trigger play and hide controls
                  try {
                    // Create a synthetic click event to trigger video play
                    const clickEvent = new MouseEvent('click', {
                      bubbles: true,
                      cancelable: true,
                      view: window
                    });
                    iframe.dispatchEvent(clickEvent);
                  } catch (e) {
                    console.log('Could not dispatch click event');
                  }
                }, 1500);
              });
              
              // Ensure container doesn't block iframe interactions
              const container = document.getElementById('player-container');
              if (container) {
                container.style.pointerEvents = 'none';
              }
              
              // Prevent zoom on double tap (but allow single taps through to iframe)
              let lastTouchEnd = 0;
              document.addEventListener('touchend', function(event) {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                  event.preventDefault();
                }
                lastTouchEnd = now;
              }, false);
              
              // Ensure all touch events reach the iframe
              document.addEventListener('touchstart', function(e) {
                if (iframe && e.target !== iframe) {
                  // Allow touch events to pass through to iframe
                  iframe.style.pointerEvents = 'auto';
                }
              }, { passive: true });
              
              // Handle clicks - forward to iframe if needed
              document.addEventListener('click', function(e) {
                if (iframe && e.target === document.body || e.target === container) {
                  // Click happened on body/container, ensure iframe can receive it
                  iframe.style.pointerEvents = 'auto';
                }
              }, true);
            })();
          </script>
        </body>
      </html>
    `;
  }, [driveId]);

  if (!driveId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid Drive URL</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="drive-video-player">
      {loading && (
        <View style={styles.loader} testID="video-loading">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer} testID="video-error">
          <Text style={styles.errorText}>Video failed to load</Text>
        </View>
      )}

      <WebView
        testID="drive-webview"
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        allowsBackForwardNavigationGestures={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        startInLoadingState={true}
        scalesPageToFit={true}
        onLoadEnd={() => {
          setLoading(false);
          setError(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[DriveVideoPlayer] WebView error:', nativeEvent);
          setLoading(false);
          setError(true);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[DriveVideoPlayer] HTTP error:', nativeEvent.statusCode);
        }}
        onMessage={(event) => {
          console.log('[DriveVideoPlayer] Message from WebView:', event.nativeEvent.data);
        }}
      />
    </View>
  );
};

export default DriveVideoPlayer;

const { width, height: screenHeight } = Dimensions.get("window");
const PLAYER_MIN_HEIGHT = Math.max(screenHeight * 0.5, width * (9 / 16));

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: PLAYER_MIN_HEIGHT,
    height: "100%",
    backgroundColor: "#000",
    position: "relative",
    flex: 1,
  },
  webview: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
