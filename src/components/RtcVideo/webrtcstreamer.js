var WebRtcStreamer = (function () {
  /**
   * Interface with WebRTC-streamer API
   * @constructor
   * @param {string} videoElement - id of the video element tag
   * @param {string} srvurl -  url of webrtc-streamer (default is current location)
   */
  var WebRtcStreamer = function WebRtcStreamer(videoElement, srvurl) {
    if (typeof videoElement === "string") {
      this.videoElement = document.getElementById(videoElement);
    } else {
      this.videoElement = videoElement;
    }
    this.srvurl =
      srvurl ||
      location.protocol +
        "//" +
        window.location.hostname +
        ":" +
        window.location.port;
    this.pc = null;

    this.mediaConstraints = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    };

    this.iceServers = null;
    this.earlyCandidates = [];
  };

  WebRtcStreamer.prototype._handleHttpErrors = function (response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  };

  /**
   * Connect a WebRTC Stream to videoElement
   * @param {string} videourl - id of WebRTC video stream
   * @param {string} audiourl - id of WebRTC audio stream
   * @param {string} options  -  options of WebRTC call
   * @param {string} stream   -  local stream to send
   * @param {string} prefmime -  prefered mime
   */
  WebRtcStreamer.prototype.connect = function (
    videourl,
    audiourl,
    options,
    localstream,
    prefmime
  ) {
    this.disconnect();
    this.videoElement.style.display = "block";
    // getIceServers is not already received
    if (!this.iceServers) {
      console.log("WebRtcStreamer-Get IceServers");

      fetch(this.srvurl + "/api/getIceServers")
        .then(this._handleHttpErrors)
        .then((response) => response.json())
        .then((response) =>
          this.onReceiveGetIceServers(
            response,
            videourl,
            audiourl,
            options,
            localstream,
            prefmime
          )
        )
        .catch((error) => this.onError("getIceServers " + error));
    } else {
      this.onReceiveGetIceServers(
        this.iceServers,
        videourl,
        audiourl,
        options,
        localstream,
        prefmime
      );
    }
  };

  /**
   * Disconnect a WebRTC Stream and clear videoElement source
   */
  WebRtcStreamer.prototype.disconnect = function () {
    const webRtcEle = document.querySelector("#webRtcEle");

    if (webRtcEle) {
      webRtcEle.style.display = "none";
    }

    if (this.videoElement?.srcObject) {
      this.videoElement.srcObject.getTracks().forEach((track) => {
        track.stop();
        this.videoElement.srcObject.removeTrack(track);
      });
    }
    if (this.pc) {
      fetch(this.srvurl + "/api/hangup?peerid=" + this.pc.peerid)
        .then(this._handleHttpErrors)
        .catch((error) => this.onError("hangup " + error));

      try {
        this.pc.close();
      } catch (e) {
        console.log("WebRtcStreamer-Failure close peer connection:" + e);
      }
      this.pc = null;
    }
  };

  /*
   * GetIceServers callback
   */
  WebRtcStreamer.prototype.onReceiveGetIceServers = function (
    iceServers,
    videourl,
    audiourl,
    options,
    stream,
    prefmime
  ) {
    this.iceServers = iceServers;
    this.pcConfig = iceServers || { iceServers: [] };
    try {
      this.createPeerConnection();

      var callurl =
        this.srvurl +
        "/api/call?peerid=" +
        this.pc.peerid +
        "&url=" +
        encodeURIComponent(videourl);
      if (audiourl) {
        callurl += "&audiourl=" + encodeURIComponent(audiourl);
      }
      if (options) {
        callurl += "&options=" + encodeURIComponent(options);
      }

      if (stream) {
        this.pc.addStream(stream);
      }

      // clear early candidates
      this.earlyCandidates.length = 0;

      // create Offer
      this.pc.createOffer(this.mediaConstraints).then(
        (sessionDescription) => {
          console.log(
            "WebRtcStreamer-Create offer:" + JSON.stringify(sessionDescription)
          );

          if (prefmime != undefined) {
            //set prefered codec
            let [prefkind] = prefmime.split("/");
            let codecs = RTCRtpReceiver.getCapabilities(prefkind).codecs;
            console.log(`WebRtcStreamer-codecs:${JSON.stringify(codecs)}`);
            let preferedCodecs = codecs.filter(
              (codec) => codec.mimeType === prefmime
            );

            console.log(
              `WebRtcStreamer-preferedCodecs:${JSON.stringify(preferedCodecs)}`
            );
            this.pc
              .getTransceivers()
              .filter(
                (transceiver) => transceiver.receiver.track.kind === prefkind
              )
              .forEach((tcvr) => {
                if (tcvr.setCodecPreferences != undefined) {
                  tcvr.setCodecPreferences(preferedCodecs);
                }
              });
          }

          this.pc.setLocalDescription(sessionDescription).then(
            () => {
              fetch(callurl, {
                method: "POST",
                body: JSON.stringify(sessionDescription)
              })
                .then(this._handleHttpErrors)
                .then((response) => response.json())
                .catch((error) => this.onError("call " + error))
                .then((response) => this.onReceiveCall(response))
                .catch((error) => this.onError("call " + error));
            },
            (error) => {
              console.log(
                "WebRtcStreamer-setLocalDescription error:" +
                  JSON.stringify(error)
              );
            }
          );
        },
        (error) => {
          alert("WebRtcStreamer-Create offer error:" + JSON.stringify(error));
        }
      );
    } catch (e) {
      this.disconnect();
      alert("connect error: " + e);
    }
  };

  WebRtcStreamer.prototype.getIceCandidate = function () {
    fetch(this.srvurl + "/api/getIceCandidate?peerid=" + this.pc.peerid)
      .then(this._handleHttpErrors)
      .then((response) => response.json())
      .then((response) => this.onReceiveCandidate(response))
      .catch((error) => this.onError("getIceCandidate " + error));
  };

  WebRtcStreamer.prototype.connectError = function () {
    const parentElement = this.videoElement.parentElement;
    const copElement = document.createElement("div");
    const webRtcEle = document.querySelector("#webRtcEle");

    if (webRtcEle) {
      this.videoElement.style.display = "none";
      webRtcEle.style.display = "block";
      return;
    }

    if (!parentElement) return;

    copElement.setAttribute("id", "webRtcEle");

    copElement.style.width = `${this.videoElement.offsetWidth}px`;
    copElement.style.height = `${this.videoElement.offsetHeight}px`;
    copElement.style.lineHeight = `${this.videoElement.offsetHeight}px`;
    // copElement.style.left = `${this.videoElement.offsetLeft}px`;
    // copElement.style.top = `${this.videoElement.offsetTop}px`;
    // copElement.style.position = "absolute";

    copElement.style.background = `black`;
    copElement.style.fontSize = `16px`;
    copElement.style.color = `white`;
    copElement.style.textAlign = `center`;

    copElement.innerText = "视频加载异常！(请检查网络连接或设备配置)";

    parentElement.appendChild(copElement);
    this.videoElement.style.display = "none";
  };

  /*
   * create RTCPeerConnection
   */
  WebRtcStreamer.prototype.createPeerConnection = function () {
    console.log(
      "WebRtcStreamer-createPeerConnection  config: " +
        JSON.stringify(this.pcConfig)
    );
    this.pc = new RTCPeerConnection(this.pcConfig);
    var pc = this.pc;
    pc.peerid = Math.random();

    pc.onicecandidate = (evt) => this.onIceCandidate(evt);
    pc.onaddstream = (evt) => this.onAddStream(evt);
    pc.oniceconnectionstatechange = (evt) => {
      console.log(
        "WebRtcStreamer-oniceconnectionstatechange  state: " +
          pc.iceConnectionState
      );
      if (this.videoElement) {
        if (pc.iceConnectionState === "connected") {
          this.videoElement.style.opacity = "1.0";
        } else if (pc.iceConnectionState === "disconnected") {
          // this.videoElement.style.opacity = "0.25";
          this.connectError();
        } else if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "closed"
        ) {
          this.videoElement.style.opacity = "0.5";
        } else if (pc.iceConnectionState === "new") {
          this.getIceCandidate();
        }
      }
    };
    pc.ondatachannel = function (evt) {
      console.log(
        "WebRtcStreamer-remote datachannel created:" + JSON.stringify(evt)
      );

      evt.channel.onopen = function () {
        console.log("WebRtcStreamer-remote datachannel open");
        this.send("remote channel openned");
      };
      evt.channel.onmessage = function (event) {
        console.log(
          "WebRtcStreamer-remote datachannel recv:" + JSON.stringify(event.data)
        );
      };
    };
    pc.onicegatheringstatechange = function () {
      if (pc.iceGatheringState === "complete") {
        const recvs = pc.getReceivers();

        recvs.forEach((recv) => {
          if (recv.track && recv.track.kind === "video") {
            console.log(
              "WebRtcStreamer-codecs:" +
                JSON.stringify(recv.getParameters().codecs)
            );
          }
        });
      }
    };

    try {
      var dataChannel = pc.createDataChannel("ClientDataChannel");
      dataChannel.onopen = function () {
        console.log("WebRtcStreamer-local datachannel open");
        this.send("local channel openned");
      };
      dataChannel.onmessage = function (evt) {
        console.log(
          "WebRtcStreamer-local datachannel recv:" + JSON.stringify(evt.data)
        );
      };
    } catch (e) {
      console.log("WebRtcStreamer-Cannor create datachannel error: " + e);
    }

    console.log(
      "WebRtcStreamer-Created RTCPeerConnnection with config: " +
        JSON.stringify(this.pcConfig)
    );
    return pc;
  };

  /*
   * RTCPeerConnection IceCandidate callback
   */
  WebRtcStreamer.prototype.onIceCandidate = function (event) {
    if (event.candidate) {
      if (this.pc.currentRemoteDescription) {
        this.addIceCandidate(this.pc.peerid, event.candidate);
      } else {
        this.earlyCandidates.push(event.candidate);
      }
    } else {
      console.log("WebRtcStreamer-End of candidates.");
    }
  };

  WebRtcStreamer.prototype.addIceCandidate = function (peerid, candidate) {
    fetch(this.srvurl + "/api/addIceCandidate?peerid=" + peerid, {
      method: "POST",
      body: JSON.stringify(candidate)
    })
      .then(this._handleHttpErrors)
      .then((response) => response.json())
      .then((response) => {
        console.log("WebRtcStreamer-addIceCandidate ok:" + response);
      })
      .catch((error) => this.onError("addIceCandidate " + error));
  };

  /*
   * RTCPeerConnection AddTrack callback
   */
  WebRtcStreamer.prototype.onAddStream = function (event) {
    console.log("WebRtcStreamer-Remote track added:" + JSON.stringify(event));

    this.videoElement.srcObject = event.stream;
    var promise = this.videoElement.play();
    if (promise !== undefined) {
      promise.catch((error) => {
        console.warn("error:" + error);
      });
    }
  };

  /*
   * AJAX /call callback
   */
  WebRtcStreamer.prototype.onReceiveCall = function (dataJson) {
    console.log("WebRtcStreamer-offer: " + JSON.stringify(dataJson));
    var descr = new RTCSessionDescription(dataJson);
    this.pc.setRemoteDescription(descr).then(
      () => {
        console.log("setRemoteDescription ok");
        while (this.earlyCandidates.length) {
          var candidate = this.earlyCandidates.shift();
          this.addIceCandidate(this.pc.peerid, candidate);
        }

        this.getIceCandidate();
      },
      (error) => {
        console.log("setRemoteDescription error:" + JSON.stringify(error));
      }
    );
  };

  /*
   * AJAX /getIceCandidate callback
   */
  WebRtcStreamer.prototype.onReceiveCandidate = function (dataJson) {
    console.log("WebRtcStreamer-candidate: " + JSON.stringify(dataJson));
    if (dataJson) {
      for (var i = 0; i < dataJson.length; i++) {
        var candidate = new RTCIceCandidate(dataJson[i]);

        console.log(
          "WebRtcStreamer-Adding ICE candidate :" + JSON.stringify(candidate)
        );
        this.pc.addIceCandidate(candidate).then(
          () => {
            console.log("addIceCandidate OK");
          },
          (error) => {
            console.log("addIceCandidate error:" + JSON.stringify(error));
          }
        );
      }
      this.pc.addIceCandidate();
    }
  };

  /*
   * AJAX callback for Error
   */
  WebRtcStreamer.prototype.onError = function (status) {
    console.log("WebRtcStreamer-onError:" + status);
  };

  return WebRtcStreamer;
})();

if (typeof window !== "undefined" && typeof window.document !== "undefined") {
  window.WebRtcStreamer = WebRtcStreamer;
}
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = WebRtcStreamer;
}
