import io from "socket.io-client";
import { useState, useRef,useEffect } from "react";
import data from "../data";
let socket;

type Message = {
  author: string;
  message: string;
  time: string;
};
type Room = {
  user: string;
  roomID: string;
  admin: boolean;
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [rooms,setRooms] = useState<Array<Room>>([]);
  const [room, setRoom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [page,setPage] = useState("Chat");
  const [logged, setLogged] = useState(false);
  const [role, setRole] = useState("user");
  const lastDivRef = useRef(null);
  useEffect(() => {
    
  }, []);
  useEffect(() => {
    socketInitializer();
    setRooms(data);
  }, []);
  const socketInitializer = async () => {
    // We just call it because we don't need anything else out of it
    await fetch("/api/socket");

    socket = io();
    socket.on("newIncomingMessage", (msg) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: msg.author, message: msg.message, time:msg.time },
      ]);
      console.log(messages);
    });
  };

  const sendMessage = async () => {
    socket.emit("createdMessage", { author: username, message,room,time: new Date().toLocaleTimeString() });
    setMessages((currentMsg) => [
      ...currentMsg,
      { author: username, message, time:new Date().toLocaleTimeString() },
    ]);
    setMessage("");
  };
  useEffect(()=>{
    lastDivRef?.current?.scrollIntoView({ behavior: 'smooth' });
  },[messages])
  const enterRoom = async (r:string) => {
    await socket.emit("enterRoom", r);
    setRoom(r);
  };
  const handleKeypress = async (e) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      if (message) {
        sendMessage();
      } 
      if(!logged){
        await login();
      }
    }
  };
  const findUserRoom =async  () =>{
    const found = rooms.find((room) => room.user===username);
    if(found){
      if(found.admin===true){
        setRole("admin");
        setPage("Dashboard");
      }
      return(found.roomID.toString())
    }else{
      alert("user not found")
    }
  }
  const login = async() =>{
      let userRoom
      (async function() {
        userRoom = await findUserRoom();
      })().then(async()=>{
        await enterRoom(userRoom);
      }).then(()=>{
        setLogged(true);
      }).catch(err=>{
        console.log(err)
      });
  }
  const goToChat = async(i) =>{
    await enterRoom(rooms[i].roomID);
    setLogged(true);
    setTo(rooms[i].user);
    setPage("Chat");
  }
  return (
    <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
      {role=="admin"&&<div className="fixed bottom-10 right-100 flex -space-x-1 overflow-hidden" onClick={()=>{setPage("Dashboard")}}>
        <img className="inline-block h-12 w-12 rounded-full ring-2 ring-green" src="https://images.unsplash.com/photo-1525081905268-fc0b46e9d786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt=""/>
      </div>}
      <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
        {(!logged) ? (
          <>
            <h3 className="font-bold text-white text-xl">
              Please enter your username !
            </h3>
            <input
              type="text"
              placeholder="Username..."
              value={username}
              className="p-3 rounded-md outline-none"
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleKeypress}
            />
            <button
              onClick={async() => { await login();}}
              className="bg-white rounded-md px-4 py-2 text-xl"
            >
              Go!
            </button>
          </>
        ) : page==="Dashboard"?(<>
            <>
              <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
                <div className="h-full last:border-b-0 overflow-y-scroll">
                  {rooms.map((room,i)=>(
                    <div className="w-full py-1 px-2 border-b border-gray-200" key={i} onClick={()=>goToChat(i)}>
                        {room.user}
                    </div>
                  ))}
                </div>
                </div>
            </>
        </>):(
            <>
            <p className="font-bold text-white text-xl">
              Your username: {username} {to!==""?`You're chatting with: ${to}`:`You're chatting with: ali`}
            </p>
            <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
              <div className="h-full last:border-b-0 overflow-y-scroll">
                {messages.map((msg, i) => {
                  if(i+1===messages.length){
                    return (
                      <div
                      className="w-full py-1 px-2 border-b border-gray-200"
                      key={i}
                      ref={lastDivRef}
                    >
                      {msg.author} : {msg.message} ~ {msg.time}
                    </div>
                    );
                  }else{
                    return (
                      <div
                      className="w-full py-1 px-2 border-b border-gray-200"
                      key={i}
                    >
                      {msg.author} : {msg.message} ~ {msg.time}
                    </div>
                    );
                  }

                })}
              </div>
              <div className="border-t border-gray-300 w-full flex rounded-bl-md">
                <input
                  type="text"
                  placeholder="New message..."
                  value={message}
                  className="outline-none py-2 px-2 rounded-bl-md flex-1"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyUp={handleKeypress}
                />
                <div className="border-l border-gray-300 flex justify-center items-center  rounded-br-md group hover:bg-purple-500 transition-all">
                  <button
                    className="group-hover:text-white px-3 h-full"
                    onClick={() => {
                      sendMessage();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
