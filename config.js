const os = require("os");
const ifaces = os.networkInterfaces();

const getLocalIp = () => {
  let localIp = "127.0.0.1";
  Object.keys(ifaces).forEach((ifname) => {
    for (const iface of ifaces[ifname]) {
      // Ignore IPv6 and 127.0.0.1
      if (iface.family !== "IPv4" || iface.internal !== false) {
        continue;
      }
      // Set the local ip to the first IPv4 address found and exit the loop
      localIp = iface.address;
      console.log(localIp, "-----------------------------");
      return;
    }
  });
  return localIp;
};

module.exports = {
  listenIp: "0.0.0.0",
  listenPort: 8000,
  sslCrt: "/etc/letsencrypt/live/test-server.dev-team-aim.com/fullchain.pem",
  sslKey: "/etc/letsencrypt/live/test-server.dev-team-aim.com/privkey.pem",
  // sslCrt: "../../../ssh/localhost+1.pem",
  // sslKey: "../../../ssh/localhost+1-key.pem",

  mediasoup: {
    // Worker settings
    numWorkers: Object.keys(os.cpus()).length,
    worker: {
      rtcMinPort: 2000,
      rtcMaxPort: 2999,
      logLevel: "warn",
      logTags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp",
        // 'rtx',
        // 'bwe',
        // 'score',
        // 'simulcast',
        // 'svc'
      ],
    },
    // Router settings
    router: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          // mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
      ],
    },
    // WebRtcTransport settings
    webRtcTransport: {
      listenIps: [
        {
          ip: "0.0.0.0", // server
          announcedIp: "52.79.251.200",
          // announcedIp: "127.0.0.1",

          // ip: "0.0.0.0", // local
          // announcedIp: getLocalIp(), // replace by public IP address
        },
      ],
      // maxIncomingBitrate: 1500000,
      // initialAvailableOutgoingBitrate: 1000000,
    },
  },
};
