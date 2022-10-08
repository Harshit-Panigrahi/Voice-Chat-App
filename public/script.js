const socket = io("/")

let peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
})

const user = prompt("Enter your name: ");
const myVideo = document.createElement("video");
myVideo.muted = true;

let myStream;
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true,
})
.then((stream)=>{
  myStream = stream;
  addStream(myVideo, stream);
  socket.on("user-connected", (userId) => {
    console.log("user connected")
    connectToNewUser(userId, stream);
  });
  peer.on("call", (call) => {
    console.log("Call");
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      console.log("stream")
      addStream(video, userVideoStream);
    });
  });
});

function connectToNewUser(userId, stream) {
  console.log("connecting to new user");
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addStream(video, userVideoStream);
  });
}

function addStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    $("#video-grid").append(video);
  })
}

$(function(){
  $("#show_chat").click(function() {
    $(".left-window").css("display", "none");
    $(".right-window").css("display", "block");
    $("#header_back").css("display", "block");
  })
  $("#header_back").click(function() {
    $(".left-window").css("display", "block");
    $(".right-window").css("display", "none");
    $("#header_back").css("display", "none");
  })

  $("#send").click(function() {
    if($("#chat_message").val().length !== 0){
      socket.emit("message", $("#chat_message").val());
      $("#chat_message").val("");
    }
  })
  $("#chat_message").keydown(function(e){
    if(e.key == "Enter" && $("#chat_message").val().length !== 0) {
      socket.emit("message", $("#chat_message").val());
      $("#chat_message").val("");
    }
  });

  $("#mute_audio").click(function() {
    const enabled = myStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myStream.getAudioTracks()[0].enabled = false;
      html = `<i class="fa fa-microphone-slash"></i>`;
      $("#mute_audio").toggleClass("background_red");
      $("#mute_audio").html(html)
    } else {
      myStream.getAudioTracks()[0].enabled = true;
      html = `<i class="fa fa-microphone"></i>`;
      $("#mute_audio").toggleClass("background_red");
      $("#mute_audio").html(html);
    }
  })

  $("#stop_video").click(function () {
    const enabled = myStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myStream.getVideoTracks()[0].enabled = false;
      html = `<i class="fa fa-video-slash"></i>`;
      $("#stop_video").toggleClass("background_red");
      $("#stop_video").html(html);
    } else {
      myStream.getVideoTracks()[0].enabled = true;
      html = `<i class="fa fa-video"></i>`;
      $("#stop_video").toggleClass("background_red");
      $("#stop_video").html(html);
    }
  });

  peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
  });

  socket.on("createMessage", (msg, username) => {
    $(".messages").append(
      `<div class="message">
        <b>
          <i class = "far fa-user-circle"></i>
          <span>${username === user ? "Me" : username}</span>
        </b>
        <span>${msg}</span>
      </div>`
    )
  })
})
