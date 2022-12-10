//FrontEnd
const socket = io('/');//socket connect to root path
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined,{ //
    host: '/',
    port: '3001'
});
//peer for sending streams and calls between room members , socket to communicate between client and server
let currentId;
let CurrentUsername;
const myVideo = document.createElement('video');
myVideo.muted = true;
//myVideo.addEventListener('click',function(){enlarge(myVideo)});
//myVideo.onclick = enlarge(myVideo);
const peers = {};
let myVideoStream;
let shareScreenISon = false;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
     myVideoStream = stream;
     addVideoStream(myVideo,stream);   
     myPeer.on('call', call =>{//when someone tries to call us
      if(call.metadata.type != "screensharing"){
         call.answer(stream);//answer call and send them our stream
         if(document.getElementById(call.peer)!=null){//insure no duplicates
           document.getElementById(call.peer).remove();
         }
         const video = document.createElement('video');
         video.id = call.peer;   
         call.on('stream' , userVideoStream =>{//add their stream when response
             addVideoStream(video,userVideoStream);
         });
         call.on("close", () => {
            video.remove();          
         });
         peers[call.peer] = call;}
         else{
            call.answer();
            var video = document.getElementById(call.peer);
            call.on('stream' , userVideoStream =>{//add their stream when response
          //    console.log("Gone Through here");
              addVideoStream(video,userVideoStream);
              userVideoStream.getVideoTracks()[0].addEventListener('ended',() =>{
                     video.remove();
              });
            });
            call.on('close',()=>{
              video.remove();
            });
         }
     });
     socket.on('user-connected', (userId) => {
         setTimeout(()=>{
             connectToNewUser(userId,stream);
         },1000);
     });
     let text = $("input");
     $('html').keydown(function (e) {
       if (e.which == 13 && text.val().length !== 0) {
         socket.emit('message', text.val(),CurrentUsername);
         text.val('')
       }
     });
     socket.on("createMessage", (message,username) => {
       $("ul").append(`<li class="message"><b>${username}:</b><br/>${message}</li>`);
       scrollToBottom()
     });
});


//navigator.mediaDevices.getDisplayMedia({ // to shareScreen
//    video: true,
//    audio: true
//}).then(stream => {
//    addVideoStream(myVideo,stream);
//});

socket.on('user-disconnected',userId =>{
    if(peers[userId])peers[userId].close();
});

myPeer.on('open', id =>{//whenever connection is established with peerserver and we have unique user id
    currentId = id;
    let username = prompt("Enter Your Name : ","Unknown");
    if(username == null || username==""){username="Unknown";}
    CurrentUsername = username;
    socket.emit('join-room', ROOM_ID, id);
});




function addVideoStream(video,stream){
   video.srcObject = stream;
   video.addEventListener('loadedmetadata',()=>{
    video.play();
   });
   videoGrid.append(video);
   video.addEventListener('click',function(){enlarge(video)});
  // video.onclick = enlarge(video);
   //const pop =  myPops.createElement('message');
}

function connectToNewUser(userId , stream){//send current stream to the newly connected user
    options = {metadata: {"type":"joining"}};
    const call = myPeer.call(userId,stream,options);//calling userId(the newly connected user) and sending them our current stream
    const video = document.createElement('video');
    call.on('stream', userVideoStream =>{//the newly connected user response stream (their stream)
        addVideoStream(video,userVideoStream);//add it to page
    });

    call.on('close',()=>{//whenever someone leaves the call 
        video.remove();
    });
//    currentId = userId;
    video.id = call.peer;
    peers[userId] = call;
}

const leaveSession = ()=>{
    socket.emit('disconnect');
}

const scrollToBottom = () => {
    var d = $('.ChattersContainer');
    d.scrollTop(d.prop("scrollHeight"));
  }

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
  
const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  
const setMuteButton = () => {
    const html = `
    <i class="fa-solid fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.mute_button').innerHTML = html;
  }
  
const setUnmuteButton = () => {
    const html = `
    <i class="unmute fa-solid fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.mute_button').innerHTML = html;
  }
  
const setStopVideo = () => {
    const html = `
      <i class="fa-solid fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.video_button').innerHTML = html;
  }
  
const setPlayVideo = () => {
    const html = `
    <i class="stop fa-solid fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.video_button').innerHTML = html;
  }

const CollapseF = () => {
  let state = arroww();
  const MainContent = document.querySelector('.mainContent');
  const ChatSide = document.querySelector('.chatSide');
  if(state){
  MainContent.style.flex = 0.95;
  ChatSide.style.flex = 0.05;
  let nodes = ChatSide.querySelectorAll('.chatSide');
  nodes.forEach(element => {
     element.style.display = 'none';
  });
 }else{
  MainContent.style.flex = 0.8;
  ChatSide.style.flex = 0.2;
  let nodes = ChatSide.querySelectorAll('.chatSide');
  nodes.forEach(element => {
     element.style.display = 'flex';
  });
 }
}


function arroww(){
  let C = document.querySelector('.CollapseF');
  let arw = C.querySelector('#right');
  let html;
  if(arw != null){
    html = `<i class="fa-solid fa-arrow-left" id="left"></i>`
    C.innerHTML = html;
    return true;
  }
  else {
   html = `<i class="fa-solid fa-arrow-right" id="right"></i>`
   C.innerHTML = html;
   return false;
  }
}

function enlarge(element){
    if(element.style.height == '300px'){
      element.style.height = '600px';
      element.style.width = '800px';
    }else{
      element.style.height = '300px';
      element.style.width = '400px';
    }
}


const shareScreenn = () =>{
 navigator.mediaDevices.getDisplayMedia({ // to shareScreen
    video: true,
    audio: true
   }).then(stream => {

    addVideoStream(myVideo,stream);
   
    for(element in peers){//notify every peer in the room that we are screensharing and send them the stream
       options = {metadata: {"type":"screensharing"}};
       const call = myPeer.call(element,stream,options);
    } 
  
    stream.getVideoTracks()[0].addEventListener('ended',()=>{
        addVideoStream(myVideo,myVideoStream);
        for(element in peers){
          options = {metadata: {"type":"joining"}};
          const call = myPeer.call(element,myVideoStream,options);
       } 
     });
   });
}

