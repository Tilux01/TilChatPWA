import { useState,createContext,useEffect } from 'react'
import SideComponents from './components/SideComponents.jsx'
import View from './components/View.jsx'
import WitChat from './components/WitChat.jsx'
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
import SignUp from './Pages/SignUp.jsx'
import SignIn from './Pages/SignIn.jsx'
import ChatDisplay from './components/ChatDisplay.jsx'
import FeedPreview from './components/FeedPreview.jsx'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, set, get, query, onValue, orderByChild, equalTo, orderByKey, update, startAt, endAt } from "firebase/database"
import { getMessaging, getToken, deleteToken, onMessage } from 'firebase/messaging';
import BlogSend from './components/BlogSend.jsx'


const firebaseConfig = {
  apiKey: "AIzaSyCoDIlOAkemogzj-Gw2G_lVO7VI7uEeIG8",
  authDomain: "tilchat-91043.firebaseapp.com",
  databaseURL: "https://tilchat-91043-default-rtdb.firebaseio.com",
  projectId: "tilchat-91043",
  storageBucket: "tilchat-91043.firebasestorage.app",
  messagingSenderId: "293755713788",
  appId: "1:293755713788:web:a28845400f6f8992a87f79",
  measurementId: "G-CP47MXQ3MG"
};

const appSettings = {
    databaseURL: "https://tilchat-91043-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app)
const analytics = getAnalytics(app);


export const ViewStateContext = createContext()
function Home(props) {
  const navigate = useNavigate()
  const [chat, setChat] = useState(false)
  const [chatInfo, setChatInfo] = useState("Hello world")
  const [chatFriendDetail, setChatFriendDetail] = useState([])
  const [feedObject, setFeedObject] = useState({})
  const [userName, setUserName] = useState()
  const [userCredentials, setUserCredentials] = useState([])
  const [chatState, setChatState] = useState("sider")
  const [showPermissionButton, setShowPermissionButton] = useState(false) 
  const [mutualRender, setMutualRender] = useState([])
  const [otherDevices, setOtherDevices] = useState()
  const [deviceUserAgent, setDeviceUserAgent] = useState()
  
  useEffect(() => {
    if (window.innerWidth > 800) {
      setChatState(()=>"")
    }
  }, [])
  
  const userNameGet = localStorage.getItem("TilChat")
  
  useEffect(() => {
    if(!userNameGet || userNameGet?.profileId == "123" || userNameGet == {}){
      navigate("/signup")
    }
    else{
      setUserName(JSON.parse(userNameGet)?.UserName)
    }
  }, [navigate])

  useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    setUserCredentials(userNameLoc)
  }, [])

  useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    onValue(ref(db,`Users/${userNameLoc? userNameLoc.UserName : null}`), (output)=>{
      if(output.exists()){
        setUserCredentials(output.val())
        if (output.val()?.UserName && output.val()?.uniqueId && output.val()?.profileId) {
          localStorage.setItem("TilChat",JSON.stringify({UserName: output.val().UserName,uniqueId: output.val().uniqueId,profileId: output.val().profileId, profilePic:output.val().profilePic}))
        }
        else{
          localStorage.setItem("TilChat", null)
          navigate("/signup")
        }
      }
      else{
        localStorage.setItem("TilChat", null)
        navigate("/signup")
      }
    })
  }, [])

  useEffect(() => {
    if(userNameGet){
      const user = JSON.parse(userNameGet)?.UserName
      onValue(ref(db, `Users/${user}/onlineCheck`), (result)=>{
        if (result.val()) {
          set(ref(db, `Users/${user}/onlineCheck`), null)
        }
      })
    }
  }, [])

  function sanitizeUserAgent(userAgent) {
    return userAgent
      .replace(/\./g, '_dot_') 
      .replace(/\#/g, '_hash_') 
      .replace(/\$/g, '_dollar_')  
      .replace(/\[/g, '_obracket_') 
      .replace(/\]/g, '_cbracket_') 
      .replace(/\//g, '_slash_') 
      .replace(/\\/g, '_backslash_')
      .replace(/\./g, '_period_');   
  }

  useEffect(() => {
    if (userNameGet) {
      const user = JSON.parse(userNameGet)?.UserName
      const userAgent = navigator.userAgent
      const deviceUA = sanitizeUserAgent(userAgent)
      setDeviceUserAgent(deviceUA)
      get(ref(db, `Devices/${user}`)) 
      .then((result)=>{
        if (result.exists()) {
          const getDevice = result.val().filter(device => device == userAgent)
          if (getDevice.length == 0) {
            localStorage.removeItem("TilChat")
            navigate("/signup")
          }
          else{
            let checkAll = result.val()
            if (result.val().length > 1) {
              const all = result.val()
              if (all[all.length - 1] == userAgent) {
                checkAll = [all[all.length - 2], all[all.length - 1]]
              }
              else{
                checkAll = [all[all.length - 1], userAgent]
              }
              
              const sanitizeExpiredDevice = sanitizeUserAgent(all[0])
              if (all.length > 2) {
                set(ref(db, `DevicesMessages/${user}/"${sanitizeExpiredDevice}"`), null)
              }
              update(ref(db, `Devices`),{ 
                [user] : checkAll 
              })
              const otherDev = checkAll.filter(device => device != userAgent)
              let sanitizedUA = []
              otherDev.map((UA)=>{
                const performSan = sanitizeUserAgent(UA)
                sanitizedUA.push(performSan)
              })
              console.log(sanitizedUA);
              setOtherDevices(sanitizedUA)
            }
          }
          
        }
        else{
          let devices = []
          devices.push(userAgent)
          update(ref(db, `Devices`),{
            [user] : devices
          })
        }
      })
    }
  }, [])

  useEffect(() => {
    const user = JSON.parse(userNameGet)?.UserName
    const userAgent = navigator.userAgent
    onValue(ref(db, `Devices/${user}`), (result)=>{
      console.log("all devices", result.val());
      if (result.exists()) {
        let checkAll = result.val()
        const getDevice = result.val().filter(device => device == userAgent)
        if (getDevice.length == 0) {
          localStorage.removeItem("TilChat")
          navigate("/signup")
        }
        else{
          if (result.val().length > 1) {
            const all = result.val()
            if (all[all.length - 1] == userAgent) {
              checkAll = [all[all.length - 2], all[all.length - 1]]
            }
            else{
              checkAll = [all[all.length - 1], userAgent]
            }
            
            const otherDev = checkAll.filter(device => device != userAgent)
            let sanitizedUA = []
            otherDev.map((UA)=>{
              const performSan = sanitizeUserAgent(UA)
              sanitizedUA.push(performSan)
            })
            console.log(sanitizedUA);
            setOtherDevices(sanitizedUA)
          }
        }
      }
    })
  }, [])



  const checkSubscriptionStatus = async (userId) => {
    try {
      const response = await fetch("https://tilchat.onrender.com/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return { valid: false, reason: "CHECK_ERROR" };
    }
  };

  const createNewSubscription = async (userId) => {
    const registration = await navigator.serviceWorker.register("/sw.js");
    
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await existing.unsubscribe();
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BI39fB0i19JTHx18xGN7ZToHxgJJMg_Mk_xyMmZozNMoDMx4-tTzi6V2e5tZpkxJVxhy0ImL2m_82cZ0E78K3zc"
    });

    await fetch("https://tilchat.onrender.com/save-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        subscription
      })
    });
  };

  const setupWebPush = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const user = JSON.parse(localStorage.getItem("TilChat"));
      if (!user?.UserName) return;
      const status = await checkSubscriptionStatus(user.UserName);
      
      if (!status.valid) {
        if (Notification.permission === 'default') {
          setShowPermissionButton(true);
          return;
        }

        if (Notification.permission !== 'granted') {
          alert("Turn on notification access to receive notification")
          return;
        }
        await createNewSubscription(user.UserName);
      } else {
      }

    } catch (err) {
    }
  };


  useEffect(() => {
    setupWebPush();
  }, []);
    
    
    
      return(
        <ViewStateContext.Provider value={props.ViewState}>
          <SideComponents mutualRender={mutualRender} setMutualRender={setMutualRender} chatState={chatState} setChatState={setChatState} userCredentials={userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} setIframeLink={props.setIframeLink} setChatView={setChat} setChatInfo={setChatInfo} chatInfo={chatInfo} setChatFriendDetail={setChatFriendDetail} chatFriendDetail={chatFriendDetail} feedObject={feedObject} setFeedObject={setFeedObject}/>
          {!chat?<View chatState={chatState} setChatState={setChatState} userCredentials={userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} iframeLink={props.iframeLink} setIframeLink={props.setIframeLink} setChatInfo={setChatInfo} feedObject={feedObject} setFeedObject={setFeedObject} setChat={setChat}/>:<ChatDisplay userCredentials={userCredentials} deviceUserAgent={deviceUserAgent} otherDevices={otherDevices} mutualRender={mutualRender} setMutualRender={setMutualRender} setChatState={setChatState} chatState={chatState} setChatInfo={setChatInfo} chatInfo={chatInfo} chatFriendDetail={chatFriendDetail}/>}
          {/* <FeedPreview/> */}
        </ViewStateContext.Provider>
      )
    
};


function App() {
  const [ViewState, setViewState] = useState("welcome")
  const [iframeLink, setIframeLink] = useState("")
  const navigate = useNavigate()
  const userNameGet = localStorage.getItem("TilChat")
  const [userName, setUserName] = useState()
  useEffect(() => {
      if(!userNameGet || userNameGet.profileId == "123" || userNameGet == {}){
          navigate("/signup")
      }
      else{
          
      }
  }, [userNameGet, navigate])
  return(
    <>
      <Routes>
        <Route path='/' element={<Home ViewState={ViewState} setViewState={setViewState} iframeLink={iframeLink} setIframeLink={setIframeLink}/>}/>
        <Route path='/dashboard' element={<Navigate to='/'/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/signin' element={<SignIn/>}/>
        <Route path="/sendBlog" element={<BlogSend/>}/>
        <Route path='/login' element={<Navigate to='/signin'/>}/>
        <Route path='*' element={<SignUp/>}/>
      </Routes>
    </>
  )
}

export default App