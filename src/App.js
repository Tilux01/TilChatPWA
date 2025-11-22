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
  useEffect(() => {
    if (window.innerWidth > 800) {
      setChatState(()=>"")
    }
  }, [])
  const userNameGet = localStorage.getItem("TilChat")
      useEffect(() => {
          if(!userNameGet){
              navigate("/signup")
          }
          else{
              setUserName(JSON.parse(userNameGet).UserName)
              
          }
      }, [navigate])

      useEffect(() => {
        if(userNameGet){
          const user = JSON.parse(userNameGet).UserName
          onValue(ref(db, `Users/${user}/onlineCheck`), (result)=>{
            if (result.val()) {
              set(ref(db, `Users/${user}/onlineCheck`), null)
            }
          })
        }
      }, [])
    
      useEffect(() => {
          const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
          get(ref(db,`Users/${userNameLoc? userNameLoc.UserName : null}`))
          .then((output)=>{
              if(output.exists()){
                  setUserCredentials(output.val())
              }
          })
      }, [])

 const setupWebPush = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    // Check current permission status
    const permission = Notification.permission;
    
    console.log('Current notification permission:', permission);

    if (permission === 'default') {
      // Permission hasn't been requested yet - show your custom UI
      console.log('🟡 Notification permission not requested yet');
      // You can set a state to show a custom permission button
      // setShowPermissionButton(true);
      return; // Don't proceed with push setup
    }

    if (permission !== 'granted') {
      console.log('❌ Notification permission denied by user');
      return;
    }

    // Only proceed if permission is granted
    console.log('✅ Notification permission already granted');

    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("✅ Service worker registered.");

    // Remove old subscription if it exists
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      console.log("ℹ️ Existing subscription found → unsubscribing...");
      await existing.unsubscribe();
    }

    // Create a new subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BI39fB0i19JTHx18xGN7ZToHxgJJMg_Mk_xyMmZozNMoDMx4-tTzi6V2e5tZpkxJVxhy0ImL2m_82cZ0E78K3zc"
    });
    console.log("✅ New subscription created:", subscription);

    // Save subscription to your backend
    const user = JSON.parse(localStorage.getItem("TilChat"));
    if (user?.UserName) {
      await fetch("https://tilchat-backend-1.onrender.com/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.UserName,
          subscription
        })
      });
      console.log("✅ Subscription saved to server.");
    }
  } catch (err) {
    console.log("❌ Web Push setup error:", err);
  }
};

async function clearOldSubscription() {
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();

  if (existing) {
    console.log("Found old subscription → Unsubscribing...");
    await existing.unsubscribe();
  }
}


useEffect(() => {
  console.log('🚀 App mounted, setting up FCM...');
  setupWebPush();
}, []);
    
    
    
      return(
        <ViewStateContext.Provider value={props.ViewState}>
          <SideComponents chatState={chatState} setChatState={setChatState} userCredentials={userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} setIframeLink={props.setIframeLink} setChatView={setChat} setChatInfo={setChatInfo} chatInfo={chatInfo} setChatFriendDetail={setChatFriendDetail} feedObject={feedObject} setFeedObject={setFeedObject}/>
          {!chat?<View chatState={chatState} setChatState={setChatState} userCredentials={userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} iframeLink={props.iframeLink} setChatInfo={setChatInfo} feedObject={feedObject} setFeedObject={setFeedObject} setChat={setChat}/>:<ChatDisplay setChatState={setChatState} chatState={chatState} setChatInfo={setChatInfo} chatInfo={chatInfo} chatFriendDetail={chatFriendDetail}/>}
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
      if(!userNameGet){
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