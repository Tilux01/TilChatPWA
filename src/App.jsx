import { useState, createContext, useEffect, useRef, useContext } from 'react'
import SideComponents from './components/SideComponents.jsx'
import View from './components/View.jsx'
import WitChat from './components/WitChat.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, data, Outlet } from 'react-router-dom';
import SignUp from './Pages/SignUp.jsx'
import SignIn from './Pages/SignIn.jsx'
import ChatDisplay from './components/ChatDisplay.jsx'
import FeedPreview from './components/FeedPreview.jsx'
import { app, db } from './firebase/config.js'
import { ref, push, set, get, query, onValue, orderByChild, equalTo, orderByKey, update, startAt, endAt, off, onChildAdded } from "firebase/database"
import BlogSend from './components/BlogSend.jsx'
import wallPapper from "./images/DefaultWallpapre.jpg"
import wallPapper2 from "./images/wallpaper2.jpg"
import wallPapper3 from "./images/wallpaper3.jpg"
import wallPapper4 from "./images/wallpaper4.jpg"
import wallPapper5 from "./images/wallpaper5.jpg"
import wallPapper6 from "./images/wallpaper6.png"
import wallPapper7 from "./images/wallpaper7.jpg"
import wallPapper8 from "./images/wallpaper8.jpg"
import wallPapper9 from "./images/wallpaper9.jpg"
import wallPapper10 from "./images/wallpaper10.png"
import UploadAbout from './components/UploadAbout.jsx';
import CallHighLine from './components/CallHighLine.jsx';
import MobileCall from './components/MobileCall.jsx';
import IncomingCall from './components/IncomingCall.jsx';
import IncomingCallMini from './components/IncomingCallMini.jsx';
import vibration from "./Sounds/708211__metaxis__smart-phone-vibration-long-bag-or-pocket-mono.mp3"
import ringingTone from "./Sounds/843982__erokia__msfxp13-80-90-bpm-ambient-low-filter-piano.mp3"
import { io } from 'socket.io-client';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useChatDB } from './chatDb.js';
import SIgnUpProceed from './Pages/SIgnUpProceed.jsx';
import createVoice, { JSVoice } from 'jsvoice';
import VoiceAi from './components/VoiceAi.jsx';
import MusiComponent from './components/MusiComponent.jsx';
import NewGroup from './components/NewGroup.jsx';



export const ViewStateContext = createContext()
function Home(props) {
  const navigate = useNavigate()
  const {
      createGroup, setCreateGroup, 
      musicActive, setMusicActive, 
      isAwake, setIsAwake, 
      chat, setChat, 
      chatInfo, setChatInfo, 
      chatFriendDetail, setChatFriendDetail, 
      feedObject, setFeedObject, 
      userName, setUserName, 
      userCredentials, setUserCredentials, 
      chatState, setChatState, 
      showPermissionButton, setShowPermissionButton, 
      mutualRender, setMutualRender, 
      otherDevices, setOtherDevices, 
      deviceUserAgent, setDeviceUserAgent, 
      forwardArray, 
      triggerForward, setTriggerForward, 
      forwardCred, 
      triggerSend, setTriggerSend, 
      forwardChatInfo, 
      chatArray, setChatArray, 
      wallPaperArray, setWallPaperArray, 
      currentWallpaper, setCurrentWallpaper, 
      friendsWallpaper, setFriendsWallpaper, 
      userAbout, setUserAbout, 
      blockedArray, setBlockedArray, 
      archivedArray, setArchivedArray, 
      friendsBlocked, setFriendBlocked, 
      chatBlocked, setChatBlocked, 
      currentCallCred, setCurrentCallCred, 
      callAccepted, setCallAccepted, 
      callBlock, setCallBlock, 
      displayCallBlock, setDisplayCallBlock, 
      callActive, setCallActive, 
      currentCount, setCurrentCount,
      micActive, setMicActive,
      callChatInfo, setCallChatInfo,
      callType, setCallType,
      currentCallWallpaper, setCurrentCallWallpaper,
      secCount, minCount, hourCount, callTimerDown, timeCountTimer,
      currentIncomeCall, setCurrentIncomingCall,
      incomingCallMini, setIncomingCallMini,
      vibrationTone, ringTone,
      callAccept, setCallAccept,
      callAcceptTimer,
      callChatId, setCallChatId,
      callEndTimer,
      pickedCall, setPickedCall,
      callEnded, setCallEnded,
      checkRecieve, gotCalling,
      videoView, setVideoView,
      chatEdited, setChatEdited,
      holdGoogleCred, setHoldGoogleCred,
      sectionOrder, setSectionOrder,
      openMsg, setOpenMsg,
      orderObj, setOrderObj,
      returnStatement, setReturnStatement,
      textPrompt, setTextPrompt,
      askMsg, setAskMsg,
      client, setClient,
      localTrack, setLocalTrack,
      incomingCall, setIncomingCall,
      currentCall,
      isJoiningChannel, setIsJoiningChannel,
      socket, remoteVideoTrack, localVideoTrack, remoteVideoElementRef, localVideoElementRef, gottenGroup,
      cleanupCall, endCall
    } = useContext(ViewStateContext)
  useEffect(() => {
    console.log(orderObj);
    if (orderObj?.action == "navigate") {
      if (orderObj?.destination.toLowerCase() == "message" || orderObj?.destination.toLowerCase() == "messages" || orderObj?.destination.toLowerCase() == "chat" || orderObj?.destination.toLowerCase() == "chats" || orderObj?.destination.toLowerCase() == "chat's") {
        setSectionOrder("Chats")
      }
      else if (orderObj?.destination.toLowerCase() == "update" || orderObj?.destination.toLowerCase() == "updates" || orderObj?.destination.toLowerCase() == "status" || orderObj?.destination.toLowerCase() == "statuses" || orderObj?.destination.toLowerCase() == "new" || orderObj?.destination.toLowerCase() == "news") {
        setSectionOrder("Updates")
      }
      else if (orderObj?.destination.toLowerCase() == "friend" || orderObj?.destination.toLowerCase() == "friends" || orderObj?.destination == "search" || orderObj?.destination.toLowerCase() == "people" || orderObj?.destination.toLowerCase() == "add friend" || orderObj?.destination.toLowerCase() == "add friends") {
        setSectionOrder("friends")
      }
      else if (orderObj?.destination.toLowerCase() == "live" || orderObj?.destination.toLowerCase() == "video" || orderObj?.destination.toLowerCase() == "movie" || orderObj?.destination.toLowerCase() == "movies" || orderObj?.destination.toLowerCase() == "videos" || orderObj?.destination.toLowerCase() == "lives" || orderObj?.destination.toLowerCase() == "play") {
        setSectionOrder("live")
      }
      else if (orderObj?.destination.toLowerCase() == "setting" || orderObj?.destination.toLowerCase() == "settings" || orderObj?.destination.toLowerCase() == "profile" || orderObj?.destination.toLowerCase() == "manage" || orderObj?.destination.toLowerCase() == "edit") {
        setSectionOrder("settings")
      }
      else if (orderObj?.destination.toLowerCase() == "ai" || orderObj?.destination.toLowerCase() == "chatbot" || orderObj?.destination.toLowerCase() == "robot" || orderObj?.destination.toLowerCase() == "chatai" || orderObj?.destination.toLowerCase() == "chat ai") {
        setSectionOrder("ai")
      }
      else {
        setReturnStatement(`Error navigating to ${orderObj?.destination} section`)
      }
    }
    else if (orderObj?.action == "message") {
      setSectionOrder("Chats")
      setOpenMsg(orderObj?.recipient)
    }
  }, [orderObj])

  useEffect(() => {
    if (callEnded) {
      clearInterval(timeCountTimer.current)
      timeCountTimer.current = undefined
      setCurrentCallCred()
      setCallAccepted(false)
      setCallBlock(false)
      setDisplayCallBlock(false)
      setCallActive(false)
      setCurrentCount("Calling...")
      setMicActive(false)
      setCallChatInfo()
      setCallType()
      setCurrentCallWallpaper()
      clearTimeout(callTimerDown.current)
      callTimerDown.current = undefined
      setCurrentIncomingCall(false)
      setIncomingCallMini(false)
      setCallAccept(false)
      clearTimeout(callAcceptTimer.current)
      callAcceptTimer.current = undefined
      setCallChatId()
      callEndTimer.current = undefined
      setPickedCall()
      checkRecieve.current = true
      gotCalling.current = true
      setVideoView(true)
      setCallEnded(false)
      rejectCall()
    }
  }, [callEnded])


  const userNameGet = localStorage.getItem("TilChat")

  useEffect(() => {
    if (!userNameGet || userNameGet?.profileId == "123" || userNameGet == {}) {
      navigate("/signup")
    }
    else {
      setUserName(JSON.parse(userNameGet)?.UserName)
    }
  }, [navigate])

  useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    setUserCredentials(userNameLoc)
  }, [])

  const {
    saveChat,
    getChat,
    getAllDirectories,
    getStats
  } = useChatDB();

  useEffect(() => {
    if (callBlock) {
      if (callAccepted) {
        timeCountTimer.current = setInterval(() => {
          secCount.current = secCount.current + 1
          if (secCount.current == 60) {
            secCount.current = 0
            minCount.current = minCount.current + 1
          }
          if (minCount.current == 60) {
            minCount.current = 0
            hourCount.current = hourCount.current + 1
          }
          let sec = secCount.current > 9 ? secCount.current : "0" + secCount.current
          let min = minCount.current > 9 ? minCount.current : "0" + minCount.current
          let hour = hourCount.current > 9 ? hourCount.current : "0" + hourCount.current
          let totalTime = `${hour}:${min}:${sec}`
          setCurrentCount(totalTime)
        }, 1000);
      }
    }
  }, [callBlock, callAccepted])

  useEffect(() => {
    if (!callBlock) {
      setCallChatId()
      setPickedCall()
      setCallChatInfo()
      setCallActive()
      setCallAccepted(false)
      setCurrentCallCred()
      clearTimeout(callTimerDown.current)
      clearTimeout(callEndTimer.current)
      setCallBlock(false)
      setDisplayCallBlock(false)
      setCallActive(false)
      setCurrentCount("Calling...")
      setMicActive(true)
      setCallChatInfo()
      setCurrentCallWallpaper()
      setCallType()
      checkRecieve.current = true
      gotCalling.current = true
      setVideoView(true)
    }
  }, [callBlock])

  useEffect(() => {
    getChat("currentWallpaper")
      .then((output) => {
        if (output) {
          setCurrentWallpaper(output)
        }
      })
    getChat("wallpaperArray")
      .then((output) => {
        if (output) {
          setWallPaperArray(output)
        }
      })
    getChat("friendsWallpaper")
      .then((output) => {
        if (output) {
          setFriendsWallpaper(output)
        }
      })
  }, [])

  useEffect(() => {
    getChat("blockedArray")
      .then((output) => {
        if (output) {
          setChatBlocked(output)
        }
      })
  }, [])

  useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    const getBlocked = onValue(ref(db, `UserBlock/${userNameLoc?.UserName}`), (output) => {
      if (output.exists()) {
        setChatBlocked(output.val())
      }
      else {
        setChatBlocked([])
      }
    })
    return getBlocked
  }, [])

  useEffect(() => {
    if (chatBlocked) {
      saveChat("blockedArray", chatBlocked)
    }
  }, [chatBlocked])

  useEffect(() => {
    getChat("archivedArray")
      .then((output) => {
        if (output) {
          setArchivedArray(output)
        }
      })
  }, [])

  useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    const getArchive = onValue(ref(db, `Archived/${userNameLoc?.UserName}`), (output) => {
      if (output.exists()) {
        setArchivedArray(output.val())
      }
      else {
        setArchivedArray([])
      }
    })
    return getArchive
  }, [])

  useEffect(() => {
    if (archivedArray) {
      saveChat("archivedArray", archivedArray)
    }
  }, [archivedArray])

  useEffect(() => {
    saveChat("currentWallpaper", currentWallpaper)
  }, [currentWallpaper])

  useEffect(() => {
    saveChat("wallpaperArray", wallPaperArray)
  }, [wallPaperArray])

  useEffect(() => {
    saveChat("friendsWallpaper", friendsWallpaper)
  }, [friendsWallpaper])

  useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    const blocked = onValue(ref(db, `Blocked/${userNameLoc?.UserName}`), (output) => {
      if (output.exists()) {
        setFriendBlocked(output.val())
      }
      else {
        setFriendBlocked([])
      }
    })
    return blocked
  }, [])

  useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    onValue(ref(db, `Users/${userNameLoc ? userNameLoc.UserName : null}`), (output) => {
      if (output.exists()) {
        setUserCredentials(output.val())
        const holdCred = output.val()
        if (output.val()?.UserName && output.val()?.uniqueId && output.val()?.profileId) {
          localStorage.setItem("TilChat", JSON.stringify({ UserName: output.val().UserName, uniqueId: output.val().uniqueId, profileId: output.val().profileId, profilePic: output.val().profilePic }))
          setMutualRender(prev => prev.map((friend) => {
            if (friend?.UserName == holdCred?.UserName) {
              return holdCred
            }
            return friend
          }))
          filterMutualRender()
          if (!(output.val()._search.email)) {
            const userName = output.val().UserName
            const mail = output.val().Email
            update(ref(db, `Users/${userName}/_search`), {
              email: mail
            })
          }

          if (!output.val()?.about) {
            setUserAbout(true)
          }
        }
        else {
          localStorage.setItem("TilChat", null)
          saveChat("friendsList", null)
          navigate("/signup")
        }
      }
      else {
        localStorage.setItem("TilChat", null)
        saveChat("friendsList", null)
        navigate("/signup")
      }
    })
  }, [])

  useEffect(() => {
    if (userNameGet) {
      const user = JSON.parse(userNameGet)?.UserName
      onValue(ref(db, `Users/${user}/onlineCheck`), (result) => {
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
        .then((result) => {
          if (result.exists()) {
            const getDevice = result.val().filter(device => device == userAgent)
            if (getDevice.length == 0) {
              localStorage.removeItem("TilChat")
              saveChat("friendsList", null)
              navigate("/signup")
            }
            else {
              let checkAll = result.val()
              if (result.val().length > 1) {
                const all = result.val()
                if (all[all.length - 1] == userAgent) {
                  checkAll = [all[all.length - 2], all[all.length - 1]]
                }
                else {
                  checkAll = [all[all.length - 1], userAgent]
                }

                const sanitizeExpiredDevice = sanitizeUserAgent(all[0])
                if (all.length > 2) {
                  set(ref(db, `DevicesMessages/${user}/"${sanitizeExpiredDevice}"`), null)
                }
                update(ref(db, `Devices`), {
                  [user]: checkAll
                })
                const otherDev = checkAll.filter(device => device != userAgent)
                let sanitizedUA = []
                otherDev.map((UA) => {
                  const performSan = sanitizeUserAgent(UA)
                  sanitizedUA.push(performSan)
                })
                setOtherDevices(sanitizedUA)
              }
            }

          }
          else {
            let devices = []
            devices.push(userAgent)
            update(ref(db, `Devices`), {
              [user]: devices
            })
          }
        })
    }
  }, [])

  useEffect(() => {
    const user = JSON.parse(userNameGet)?.UserName
    const userAgent = navigator.userAgent
    onValue(ref(db, `Devices/${user}`), (result) => {
      if (result.exists()) {
        let checkAll = result.val()
        const getDevice = result.val().filter(device => device == userAgent)
        if (getDevice.length == 0) {
          localStorage.removeItem("TilChat")
          saveChat("friendsList", null)
          navigate("/signup")
        }
        else {
          if (result.val().length > 1) {
            const all = result.val()
            if (all[all.length - 1] == userAgent) {
              checkAll = [all[all.length - 2], all[all.length - 1]]
            }
            else {
              checkAll = [all[all.length - 1], userAgent]
            }

            const otherDev = checkAll.filter(device => device != userAgent)
            let sanitizedUA = []
            otherDev.map((UA) => {
              const performSan = sanitizeUserAgent(UA)
              sanitizedUA.push(performSan)
            })
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
    if (callActive) {
      callTimerDown.current = setTimeout(() => {
        if (currentCount == "Calling..." || currentCount == "Ringing...") {
          setCallEnded(true)
          setCallActive(false)
          setCurrentCount("No response")
          const user = JSON.parse(localStorage.getItem("TilChat"));
          const UserName = user?.UserName
          getChat(currentCall.current?.others.info)
            .then((output) => {
              if (output) {
                let holdOutput = output
                const filterChat = holdOutput.findIndex(chat => chat[Object.keys(chat)[0]].id == currentCall.current?.others?.id)
                if (filterChat) {
                  holdOutput[filterChat][Object.keys(holdOutput[filterChat])].acccept = "No response"
                  saveChat(currentCall.current?.others?.info, holdOutput)
                    .then(() => {
                      setChatEdited(holdOutput[filterChat][Object.keys(holdOutput[filterChat])])
                    })
                }
              }
            })
            .finally(() => {
              cleanupCall()
            })
          if (displayCallBlock == "highline") {
            setChatFriendDetail(() => currentCallCred)
            setCallBlock(false)
            setDisplayCallBlock(false)
            setCallActive(false)
            setCurrentCount("Calling...")
            setMicActive(true)
            setCallChatInfo()
            setCurrentCallWallpaper()
          }
        }
        else {
          clearTimeout(callTimerDown.current)
          secCount.current = 0
          minCount.current = 0
          hourCount.current = 0
        }
      }, 40000);
    }
  }, [callActive])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("TilChat"));
    const UserName = user?.UserName
    const friendUpdated = onValue(ref(db, `Update/${UserName}`), ((output) => {
      if (output.exists()) {
        const holdValue = output.val()
        let AllUpdateArry = Object.keys(holdValue)
        AllUpdateArry.map((updated) => {
          get(ref(db, `Users/${updated}`))
            .then((resultCred) => {
              const result = resultCred.val()
              setMutualRender(prev => prev.map((mutuals) => {
                if (mutuals?.UserName == updated) {
                  return result
                }
                return mutuals
              }))
            })
        })
        filterMutualRender()
        set(ref(db, `Update/${UserName}`), null)
      }
    }))
    return friendUpdated
  }, [])





  // const localAudio = useRef();
  // const remoteAudio = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("TilChat"));
    const UserName = user?.UserName
    socket.current = io("https://call-test-backend.onrender.com");
    socket.current.on("connect", () => {
      socket.current.emit("register", UserName);
    });
    socket.current.on('incoming-call', async (data) => {
      setVideoView(false)
      const value = data.others
      clearInterval(callAcceptTimer.current)
      setCurrentIncomingCall({ cred: value })
      currentCall.current = data;
      setIncomingCall(data);
      setCallType(data.others.Type)
    });

    socket.current.on("call-accepted", async (data) => {
      setTimeout(async () => {
        await joinAgoraChannel();
      }, 1000);
    });

    socket.current.on('call-rejected', (data) => {
      const user = JSON.parse(localStorage.getItem("TilChat"));
      const UserName = user?.UserName
      if (currentCall.current || data.from == UserName) {
        getChat(currentCall.current?.others.info)
          .then((output) => {
            if (output) {
              let holdOutput = output
              const filterChat = holdOutput.findIndex(chat => chat[Object.keys(chat)[0]]?.id == currentCall.current?.others?.id)
              // alert(currentCall.current?.others?.id)
              if (filterChat && filterChat >= 0) {
                holdOutput[filterChat][Object.keys(holdOutput[filterChat])].acccept = "call rejected"
                saveChat(currentCall.current?.others?.info, holdOutput)
                  .then(() => {
                    setChatEdited(holdOutput[filterChat][Object.keys(holdOutput[filterChat])])
                  })
              }
            }
          })
          .finally(() => {
            cleanupCall()
          })
        setCallActive(false)
        setCurrentCount("User Busy")
        callEndTimer.current = setTimeout(() => {
          setCurrentCallCred()
          setCallBlock(false)
          setDisplayCallBlock(false)
          clearTimeout(callTimerDown.current)
          setCallActive(false)
          setCurrentCount("Calling...")
          setMicActive(true)
          setCallChatInfo()
          setCurrentCallWallpaper()
        }, 3000);
      }
    });

    socket.current.on('call-ended', (data) => {
      console.log(data)
      const user = JSON.parse(localStorage.getItem("TilChat"));
      const UserName = user?.UserName
      if (currentCall.current || data.from == UserName) {
        let holdTIme
        if (hourCount.current != 0) {
          if (hourCount.current == 1 && minCount.current == 1) {
            holdTIme = `${hourCount.current}hour ${minCount.current}min`
          }
          else if (hourCount.current != 1 && minCount.current == 1) {
            holdTIme = `${hourCount.current}hours ${minCount.current}min`
          }
          else if (hourCount.current == 1 && minCount.current != 1) {
            holdTIme = `${hourCount.current}hour ${minCount.current}mins`
          }
          else {
            holdTIme = `${hourCount.current}hours ${minCount.current}mins`
          }
        }
        else if (minCount.current != 0) {
          if (minCount.current == 1 && secCount.current == 1) {
            holdTIme = `${minCount.current}min ${secCount.current}sec`
          }
          else if (minCount.current != 1 && secCount.current == 1) {
            holdTIme = `${minCount.current}mins ${secCount.current}sec`
          }
          else if (minCount.current == 1 && secCount.current != 1) {
            holdTIme = `${minCount.current}min ${secCount.current}secs`
          }
          else {
            holdTIme = `${minCount.current}mins ${secCount.current}secs`
          }
        }
        else {
          if (secCount.current == 1) {
            holdTIme = `${secCount.current}sec`
          }
          else {
            holdTIme = `${secCount.current}secs`
          }
        }
        getChat(currentCall.current?.others.info)
          .then((output) => {
            if (output) {
              let holdOutput = output
              const filterChat = holdOutput.findIndex(chat => chat[Object.keys(chat)[0]].id == currentCall.current?.others?.id)
              if (filterChat && filterChat >= 0) {
                // alert(filterChat)
                holdOutput[filterChat][Object.keys(holdOutput[filterChat])].acccept = "call ended"
                holdOutput[filterChat][Object.keys(holdOutput[filterChat])].time = holdTIme
                saveChat(currentCall.current?.others?.info, holdOutput)
                  .then(() => {
                    setChatEdited(holdOutput[filterChat][Object.keys(holdOutput[filterChat])])
                  })
              }
            }
          })
          .finally(() => {
            cleanupCall()
            setCallEnded(true)
          })
      }
      setCallActive(false)
      setCurrentCount("Call Ended")
      secCount.current = 0
      minCount.current = 0
      hourCount.current = 0
      clearInterval(timeCountTimer.current)
      timeCountTimer.current = null
      callEndTimer.current = setTimeout(() => {
        setCallActive(false)
        setCurrentCallCred()
        setCallBlock(false)
        setCallEnded(true)
        setDisplayCallBlock(false)
        clearTimeout(callTimerDown.current)
        setCurrentCount("Calling...")
        setMicActive(true)
        setCallChatInfo()
        setCurrentCallWallpaper()
      }, 3000);
    });

    socket.current.on('user-unavailable', (username) => {
      setCallActive(false)
      setCurrentCount("Call failed")
      const user = JSON.parse(localStorage.getItem("TilChat"));
      const UserName = user?.UserName;
      getChat(currentCall.current?.others.info)
        .then((output) => {
          if (output) {
            let holdOutput = output
            const filterChat = holdOutput.findIndex(chat => chat[Object.keys(chat)[0]].id == currentCall.current?.others?.id)
            if (filterChat && filterChat >= 0) {
              const key = Object.keys(holdOutput[filterChat])
              holdOutput[filterChat][key].acccept = "failed"
              // alert(holdOutput[filterChat][key].acccept)
              saveChat(currentCall.current?.others?.info, holdOutput)
                .then(() => {
                  setChatEdited(holdOutput[filterChat][key])
                })
            }
          }
        })
        .finally(() => {
          cleanupCall()
        })
      secCount.current = 0
      minCount.current = 0
      hourCount.current = 0
      clearInterval(timeCountTimer.current)
      timeCountTimer.current = null
      callEndTimer.current = setTimeout(() => {
        setCallActive(false)
        setCallEnded(true)
        setCurrentCallCred()
        setCallBlock(false)
        setDisplayCallBlock(false)
        clearTimeout(callTimerDown.current)
        setCurrentCount("Calling...")
        setMicActive(true)
        setCallChatInfo()
        setCurrentCallWallpaper()
      }, 3000);
    });

    socket.current.on('user-disconnected', (username) => {
      if (userName == currentCall.current?.from || username == currentCall.current?.to) {
        const user = JSON.parse(localStorage.getItem("TilChat"));
        const UserName = user?.UserName
        if (currentCall.current || data.from == UserName) {
          let holdTIme
          if (hourCount.current != 0) {
            if (hourCount.current == 1 && minCount.current == 1) {
              holdTIme = `${hourCount.current}hour ${minCount.current}min`
            }
            else if (hourCount.current != 1 && minCount.current == 1) {
              holdTIme = `${hourCount.current}hours ${minCount.current}min`
            }
            else if (hourCount.current == 1 && minCount.current != 1) {
              holdTIme = `${hourCount.current}hour ${minCount.current}mins`
            }
            else {
              holdTIme = `${hourCount.current}hours ${minCount.current}mins`
            }
          }
          else if (minCount.current != 0) {
            if (minCount.current == 1 && secCount.current == 1) {
              holdTIme = `${minCount.current}min ${secCount.current}sec`
            }
            else if (minCount.current != 1 && secCount.current == 1) {
              holdTIme = `${minCount.current}mins ${secCount.current}sec`
            }
            else if (minCount.current == 1 && secCount.current != 1) {
              holdTIme = `${minCount.current}min ${secCount.current}secs`
            }
            else {
              holdTIme = `${minCount.current}mins ${secCount.current}secs`
            }
          }
          else {
            if (secCount.current == 1) {
              holdTIme = `${secCount.current}sec`
            }
            else {
              holdTIme = `${secCount.current}secs`
            }
          }
          getChat(currentCall.current?.others.info)
            .then((output) => {
              if (output) {
                let holdOutput = output
                const filterChat = holdOutput.findIndex(chat => chat[Object.keys(chat)[0]].id == currentCall.current?.others?.id)
                if (filterChat && filterChat >= 0) {
                  // alert(filterChat)
                  holdOutput[filterChat][Object.keys(holdOutput[filterChat])].acccept = "call ended"
                  holdOutput[filterChat][Object.keys(holdOutput[filterChat])].time = holdTIme
                  saveChat(currentCall.current?.others?.info, holdOutput)
                    .then(() => {
                      setChatEdited(holdOutput[filterChat][Object.keys(holdOutput[filterChat])])
                    })
                }
              }
            })
            .finally(() => {
              cleanupCall()
              setCallEnded(true)
            })
        }
        setCallActive(false)
        setCurrentCount("Call Ended")
        secCount.current = 0
        minCount.current = 0
        hourCount.current = 0
        clearInterval(timeCountTimer.current)
        timeCountTimer.current = null
        callEndTimer.current = setTimeout(() => {
          setCallActive(false)
          setCurrentCallCred()
          setCallBlock(false)
          setCallEnded(true)
          setDisplayCallBlock(false)
          clearTimeout(callTimerDown.current)
          setCurrentCount("Calling...")
          setMicActive(true)
          setCallChatInfo()
          setCurrentCallWallpaper()
        }, 3000);
      }
    });

    return () => {
      if (client) client.leave();
      if (localTrack) localTrack.close();
      socket.current.disconnect();
    };
  }, [])

  const fetchAgoraToken = async (channel, uid) => {
    const res = await fetch(
      `https://call-test-backend.onrender.com/agora/token?channel=${channel}&uid=${uid}`
    );
    const data = await res.json();
    return data.token;
  };


  const joinAgoraChannel = async () => {
    if (client || isJoiningChannel) return;
    setIsJoiningChannel(true);
    try {
      const user = JSON.parse(localStorage.getItem("TilChat"));
      const UserName = user?.UserName;
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
        else if (mediaType == "video") {
          if (remoteVideoElementRef.current) {
            user.videoTrack.play(remoteVideoElementRef.current);
          }
        }
      });
      const channelName = currentCall.current?.channel;
      if (!channelName) {
        return;
      }

      const uid = Math.floor(Math.random() * 100000);

      const token = await fetchAgoraToken(channelName, uid);

      await agoraClient.join(
        "9272412a2c134265afe374df11d2e5cc",
        channelName,
        token,
        uid
      );

      setClient(agoraClient);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalTrack(audioTrack);

      let videoTrack = null;
      if (currentCall.current?.others.Type == "video") {
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrack.current = videoTrack
        if (localVideoElementRef.current) {
          videoTrack.play(localVideoElementRef.current);
        }
      }

      const tracksToPublish = [audioTrack];
      if (videoTrack) {
        tracksToPublish.push(videoTrack);
      }
      await agoraClient.publish(tracksToPublish);

    } catch (error) {
      console.log(error);
    }
    finally {
      setIsJoiningChannel(false);
    }
  };



  const startCall = async (remoteUserId) => {
    const user = JSON.parse(localStorage.getItem("TilChat"));
    const UserName = user?.UserName
    try {
      const channel = `call-${UserName}-${Date.now()}`;
      currentCall.current = {
        to: remoteUserId,
        from: UserName,
        channel: channel,
        others: {
          UserName,
          Type: callType,
          id: callChatId,
          info: callChatInfo,
        },
      };
      socket.current.emit("call-user", {
        to: remoteUserId,
        from: UserName,
        channel,
        others: {
          UserName,
          Type: callType,
          id: callChatId,
          info: callChatInfo,
        },
      });
      joinAgoraChannel();
    } catch (error) {
      console.log(error);
      cleanupCall()
      setCallActive(false)
      setCurrentCount("Call failed")
      secCount.current = 0
      minCount.current = 0
      hourCount.current = 0
      clearInterval(timeCountTimer.current)
      timeCountTimer.current = null
      callEndTimer.current = setTimeout(() => {
        setCallActive(false)
        setCallEnded(true)
        setCurrentCallCred()
        setCallBlock(false)
        setDisplayCallBlock(false)
        clearTimeout(callTimerDown.current)
        setCurrentCount("Calling...")
        setMicActive(true)
        setCallChatInfo()
        setCurrentCallWallpaper()
      }, 3000);
    }
  }

  const answerCall = async () => {
    if (!currentCall.current || isJoiningChannel) return;
    const user = JSON.parse(localStorage.getItem("TilChat"));
    const UserName = user?.UserName
    try {
      socket.current.emit("accept-call", { from: currentCall.current.from });
      setIncomingCall(null);
      await joinAgoraChannel();

    } catch (error) {
    }
  };

  const rejectCall = () => {
    if (!currentCall.current) return;
    const user = JSON.parse(localStorage.getItem("TilChat"));
    const UserName = user?.UserName
    socket.current.emit("reject-call", {
      to: currentCall.current.from,
      from: UserName,
    });
    cleanupCall();
  }


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("TilChat"));
    const UserName = user?.UserName
    if (currentCallCred) {
      if (callActive) {
        if (!pickedCall) {
          if (!callAccepted) {
            startCall(currentCallCred.UserName)
          }
        }
      }
    }
  }, [callBlock, currentCallCred, callActive, pickedCall, callAccepted])


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("TilChat"));
    if (currentCallCred) {
      if (callActive) {
        if (callActive) {
          if (!pickedCall) {
            const checkOnline = onValue(ref(db, `CallRing/${currentCallCred?.UserName}/${user?.UserName}`), (output) => {
              if (!output.exists()) {
                setCurrentCount("Ringing...")
              }
            })
            return checkOnline
          }
        }
      }
    }
  }, [callBlock, currentCallCred, callActive, pickedCall])

  const cancelCall = () => {
    vibrationTone.current.pause()
    ringTone.current.pause()
    vibrationTone.current.currentTIme = 0
    ringTone.current.currentTIme = 0
    setIncomingCallMini(false)
    clearTimeout(callAcceptTimer.current)
    setCurrentIncomingCall()
  }
  useEffect(() => {
    if (currentIncomeCall) {
      callAcceptTimer.current = setTimeout(() => {
        if (callAccept == false) {
          getChat(currentCall.current?.others.info)
            .then((output) => {
              // if (output) {
              //   let holdOutput = output
              //   const filterChat = holdOutput.findIndex(chat=> chat[Object.keys(chat)[0]].id == currentCall.current?.others?.id)
              //   if (filterChat) {
              //     alert(filterChat)
              //     holdOutput[filterChat][Object.keys(holdOutput[filterChat])].acccept = "Timed out"
              //     saveChat(currentCall.current?.others?.info, holdOutput)
              //     .then(()=>{
              //       setChatEdited(holdOutput[filterChat][Object.keys(holdOutput[filterChat])])
              //     })
              //   }
              // }
            })
            .finally(() => {
              cleanupCall()
            })
          cancelCall()
        }
      }, 40000);
      if (currentIncomeCall) {
        document.addEventListener("click", console.log("incoming call"))
        vibrationTone.current.loop = true;
        vibrationTone.current.play()
        ringTone.current.play()
      }
      else {
        vibrationTone.current.pause()
        ringTone.current.pause()
        vibrationTone.current.currentTIme = 0
        ringTone.current.currentTIme = 0
      }
    }
    else {
      vibrationTone.current.pause()
      ringTone.current.pause()
      vibrationTone.current.currentTIme = 0
      ringTone.current.currentTIme = 0
      setIncomingCallMini(false)
      clearInterval(callAcceptTimer.current)
    }
  }, [currentIncomeCall])

  useEffect(() => {
    if (callAccept) {
      setCallBlock(true)
      setPickedCall(true)
      setCallAccepted(true)
      setCallChatInfo(currentIncomeCall?.cred.info)
      setVideoView(false)
      const checkFriendWallpaper = friendsWallpaper.filter(wallpaper => Object.keys(wallpaper)[0] == currentIncomeCall?.cred?.UserName)
      if (checkFriendWallpaper.length > 0) {
        setCurrentCallWallpaper(checkFriendWallpaper[0][currentIncomeCall?.cred?.UserName])
      }
      else {
        setCurrentCallWallpaper(currentWallpaper)
      }
      const filterFriend = mutualRender.filter(friend => friend?.UserName == currentIncomeCall?.cred?.UserName)
      if (filterFriend.length > 0) {
        setCurrentCallCred(filterFriend[0])
      }
      if (window.innerWidth <= 800) {
        setDisplayCallBlock("mobile")
      }
      else {
        setDisplayCallBlock("display")
      }
      setCallChatId(currentIncomeCall?.cred?.id)
      setCurrentIncomingCall()
    }
  }, [callAccept])

  useEffect(() => {
    if (pickedCall) {
      const checkCheckPickedConfirm = onValue(ref(db, `Call/${callChatInfo}`), (output) => {
        if (!output.exists()) {
          setCallActive(true)
          setCurrentCount("connecting")
          if (gotCalling.current) {
            answerCall()
          }
          gotCalling.current = false
        }
      })
      return checkCheckPickedConfirm
    }
  }, [pickedCall, currentCallCred])

  useEffect(() => {
    if (callBlock) {
      if (callChatInfo) {
        if (!pickedCall) {
          const confirmPick = onValue(ref(db, `Call/${callChatInfo}`), (output) => {
            if (output.exists()) {
              setCallActive(true)
              setCurrentCount("connecting")
              setCallAccepted(true)
              clearInterval(callTimerDown.current)
              set(ref(db, `Call/${callChatInfo}`), null)
            }
          })
          return confirmPick
        }
      }
    }
  }, [callChatInfo, pickedCall, callBlock])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("TilChat"));
    if (callBlock) {
      const endCall = onValue(ref(db, `CallEnded/${currentCallCred?.UserName}/${user?.UserName}`), (output) => {
        if (output.val()) {
          setCallBlock(false)
          secCount.current = 0
          minCount.current = 0
          hourCount.current = 0
          setCallEnded(true)
          endCall()
          set(ref(db, `CallEnded/${currentCallCred.UserName}/${user?.UserName}`), null)
        }
      })
      return endCall
    }
  }, [callBlock, currentCallCred])




  useEffect(() => {
    if (currentIncomeCall) {
      const user = JSON.parse(localStorage.getItem("TilChat"));
      const checkForCancel = onValue(ref(db, `CanceledCall/${currentIncomeCall?.cred?.UserName}/${user?.UserName}`), (output) => {
        if (output.exists()) {
          cancelCall()
          set(ref(db, `CanceledCall/${currentIncomeCall?.cred?.UserName}/${user?.UserName}`), null)
        }
      })
      return checkForCancel
    }
  }, [currentIncomeCall])

  useEffect(() => {

    document.addEventListener("keydown", (key) => {
      if (key?.ctrlKey && key?.shiftKey && key?.key.toLocaleLowerCase() == "m") {
        key.preventDefault()
        setMusicActive(true)
      }
    })
    document.addEventListener("keydown", (key) => {
      if (key?.ctrlKey && (key?.key.toLocaleLowerCase() == "t" || key?.key.toLocaleLowerCase() == "q")) {
        key.preventDefault()
        setIsAwake(true)
      }
    })
  }, [])


  useEffect(() => {
    filterMutualRender()
  }, [])


  const filterMutualRender = () => {
    console.log(mutualRender);
    if (mutualRender?.length == 0) {
      return
    }
    setMutualRender(prev => 
        prev.filter((item, index, self) => 
            index === self.findIndex(render => 
                (render?.UUID && render?.UUID === item?.UUID) || 
                (render?.UserName && render?.UserName === item?.UserName)
            )
        )
    )
  }


  useEffect(() => {
    setupWebPush();
    if (window?.innerWidth <= 600) {
      navigate("/menu")
    }
  }, [])
  return (
    <>
      {musicActive ? <MusiComponent setMusicActive={setMusicActive} /> : null}
      {isAwake ? <VoiceAi setAskMsg={setAskMsg} askMsg={askMsg} returnStatement={returnStatement} setReturnStatement={setReturnStatement} setOrderObj={setOrderObj} userCredentials={userCredentials} setIsAwake={setIsAwake} isAwake={isAwake} /> : null}
      {currentIncomeCall && !incomingCallMini ? <IncomingCall rejectCall={rejectCall} setCallEnded={setCallEnded} setCurrentIncomingCall={setCurrentIncomingCall} setCallAccept={setCallAccept} callAcceptTimer={callAcceptTimer} cred={currentIncomeCall} mutualRender={mutualRender} setIncomingCallMini={setIncomingCallMini} /> : currentIncomeCall && incomingCallMini ? <IncomingCallMini rejectCall={rejectCall} setCallEnded={setCallEnded} setCallAccept={setCallAccept} setCurrentIncomingCall={setCurrentIncomingCall} callAcceptTimer={callAcceptTimer} setIncomingCallMini={setIncomingCallMini} cred={currentIncomeCall} mutualRender={mutualRender} /> : null}
      {displayCallBlock == "highline" && callActive && !incomingCallMini ? <CallHighLine handleEndCall={endCall} setCallEnded={setCallEnded} setCurrentIncomingCall={setCurrentIncomingCall} callAccepted={callAccepted} setMicActive={setMicActive} micActive={micActive} currentCallCred={currentCallCred} currentCount={currentCount} setDisplayCallBlock={setDisplayCallBlock} /> : displayCallBlock == "mobile" ? <MobileCall localVideoTrack={localVideoElementRef} remoteVideoTrack={remoteVideoElementRef} setVideoView={setVideoView} videoView={videoView} callType={callType} cleanupCall={cleanupCall} handleEndCall={endCall} setCallEnded={setCallEnded} setCurrentIncomingCall={setCurrentIncomingCall} callAccepted={callAccepted} callTimerDown={callTimerDown} callEndTimer={callEndTimer} setCallType={setCallType} setDisplayCallBlock={setDisplayCallBlock} setCurrentCallWallpaper={setCurrentCallWallpaper} setChatState={setChatState} setChatInfo={setChatInfo} setChatFriendDetail={setChatFriendDetail} setCallChatInfo={setCallChatInfo} callChatInfo={callChatInfo} setMicActive={setMicActive} micActive={micActive} currentCallWallpaper={currentCallWallpaper} currentCallCred={currentCallCred} currentCount={currentCount} setCallBlock={setDisplayCallBlock} callActive={callActive} setCallActive={setCallActive} setCurrentCount={setCurrentCount} /> : null}
      {userAbout ? <UploadAbout setUserAbout={setUserAbout} userCredentials={userCredentials} /> : null}
      {
        window?.innerWidth <= 600?
          null
        :
        <>
        <SideComponents setCreateGroup={setCreateGroup} setAskMsg={setAskMsg} openMsg={openMsg} setOpenMsg={setOpenMsg} setReturnStatement={setReturnStatement} sectionOrder={sectionOrder} setSectionOrder={setSectionOrder} setIsAwake={setIsAwake} isAwake={isAwake} chatBlocked={chatBlocked} setChatBloceeked={setChatBlocked} archivedArray={archivedArray} setArchivedArray={setArchivedArray} friendsWallpaper={friendsWallpaper} currentWallpaper={currentWallpaper} chatArray={chatArray} setChatArray={setChatArray} forwardChatInfo={forwardChatInfo} deviceUserAgent={deviceUserAgent} otherDevices={otherDevices} chatState={chatState} chatInfo={chatInfo} chatFriendDetail={chatFriendDetail} wallPaperArray={wallPaperArray} setWallPaperArray={setWallPaperArray} setCurrentWallpaper={setCurrentWallpaper} setTriggerSend={setTriggerSend} triggerForward={triggerForward} forwardArray={forwardArray} mutualRender={mutualRender} setMutualRender={setMutualRender} setChatState={setChatState} userCredentials={userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} setIframeLink={props.setIframeLink} setChatView={setChat} setChatInfo={setChatInfo} setChatFriendDetail={setChatFriendDetail} feedObject={feedObject} setFeedObject={setFeedObject} />
        {!chat ? <View chatState={chatState} setChatState={setChatState} userCredentials={userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} iframeLink={props.iframeLink} setIframeLink={props.setIframeLink} setChatInfo={setChatInfo} feedObject={feedObject} setFeedObject={setFeedObject} setChat={setChat} /> : <ChatDisplay secCount={secCount} minCount={minCount} hourCount={hourCount} chatEdited={chatEdited} setChatEdited={setChatEdited} localVideoTrack={localVideoElementRef} remoteVideoTrack={remoteVideoElementRef} setVideoView={setVideoView} videoView={videoView} cleanupCall={cleanupCall} handleEndCall={endCall} setCallEnded={setCallEnded} setCurrentIncomingCall={setCurrentIncomingCall} setCallChatId={setCallChatId} callTimerDown={callTimerDown} callEndTimer={callEndTimer} setCallType={setCallType} callType={callType} setCallChatInfo={setCallChatInfo} callChatInfo={callChatInfo} callActive={callActive} setCallActive={setCallActive} setMicActive={setMicActive} micActive={micActive} setCurrentCallWallpaper={setCurrentCallWallpaper} displayCallBlock={displayCallBlock} setDisplayCallBlock={setDisplayCallBlock} currentCount={currentCount} setCurrentCount={setCurrentCount} currentCallCred={currentCallCred} setCurrentCallCred={setCurrentCallCred} callAccepted={callAccepted} setCallAccepted={setCallAccepted} callBlock={callBlock} setCallBlock={setCallBlock} friendsBlocked={friendsBlocked} setFriendBlocked={setFriendBlocked} chatBlocked={chatBlocked} setChatBlocked={setChatBlocked} archivedArray={archivedArray} setArchivedArray={setArchivedArray} blockedArray={blockedArray} setBlockedArray={setBlockedArray} friendsWallpaper={friendsWallpaper} setFriendsWallpaper={setFriendsWallpaper} wallPaperArray={wallPaperArray} setWallPaperArray={setWallPaperArray} currentWallpaper={currentWallpaper} setCurrentWallpaper={setCurrentWallpaper} chatArray={chatArray} setChatArray={setChatArray} forwardChatInfo={forwardChatInfo} setTriggerSend={setTriggerSend} triggerSend={triggerSend} forwardCred={forwardCred} setTriggerForward={setTriggerForward} forwardArray={forwardArray} userCredentials={userCredentials} deviceUserAgent={deviceUserAgent} otherDevices={otherDevices} mutualRender={mutualRender} setMutualRender={setMutualRender} setChatState={setChatState} chatState={chatState} setChatInfo={setChatInfo} chatInfo={chatInfo} setChatFriendDetail={setChatFriendDetail} chatFriendDetail={chatFriendDetail} />}
        {/* <FeedPreview/> */}
        <Outlet />
        </>
      }
      {createGroup ? <NewGroup setCreateGroup={setCreateGroup} setMutualRender={setMutualRender} mutualRender={mutualRender} userCredentials={userCredentials} /> : null}
    </>
  )
};


function App() {
  const [ViewState, setViewState] = useState("welcome")
  const [iframeLink, setIframeLink] = useState("")
  const navigate = useNavigate()
  const userNameGet = localStorage.getItem("TilChat")
   const [createGroup, setCreateGroup] = useState(false)
  const [musicActive, setMusicActive] = useState(false)
  const [isAwake, setIsAwake] = useState(false);
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
  const forwardArray = useRef([])
  const [triggerForward, setTriggerForward] = useState(false)
  const forwardCred = useRef()
  const [triggerSend, setTriggerSend] = useState(false)
  const forwardChatInfo = useRef([])
  const [chatArray, setChatArray] = useState([])
  const [wallPaperArray, setWallPaperArray] = useState([wallPapper, wallPapper2, wallPapper3, wallPapper4, wallPapper5, wallPapper6, wallPapper7, wallPapper8, wallPapper9, wallPapper10])
  const [currentWallpaper, setCurrentWallpaper] = useState(wallPapper5)
  const [friendsWallpaper, setFriendsWallpaper] = useState([])
  const [userAbout, setUserAbout] = useState(false)
  const [blockedArray, setBlockedArray] = useState([])
  const [archivedArray, setArchivedArray] = useState(["hello"])
  const [friendsBlocked, setFriendBlocked] = useState([])
  const [chatBlocked, setChatBlocked] = useState([])
  const [currentCallCred, setCurrentCallCred] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [callBlock, setCallBlock] = useState(false)
  const [displayCallBlock, setDisplayCallBlock] = useState(false)
  const [callActive, setCallActive] = useState(false)
  const [currentCount, setCurrentCount] = useState("Calling...")
  const [micActive, setMicActive] = useState(true)
  const [callChatInfo, setCallChatInfo] = useState()
  const [callType, setCallType] = useState()
  const [currentCallWallpaper, setCurrentCallWallpaper] = useState()
  const secCount = useRef(0)
  const minCount = useRef(0)
  const hourCount = useRef(0)
  const callTimerDown = useRef()
  const timeCountTimer = useRef()
  const [currentIncomeCall, setCurrentIncomingCall] = useState(false)
  const [incomingCallMini, setIncomingCallMini] = useState(false)
  const vibrationTone = useRef(new Audio(vibration))
  const ringTone = useRef(new Audio(ringingTone))
  const [callAccept, setCallAccept] = useState(false)
  const callAcceptTimer = useRef()
  const [callChatId, setCallChatId] = useState()
  const callEndTimer = useRef()
  const [pickedCall, setPickedCall] = useState()
  const [callEnded, setCallEnded] = useState(false)
  const checkRecieve = useRef(true)
  const gotCalling = useRef(true)
  const [videoView, setVideoView] = useState(true)
  const [chatEdited, setChatEdited] = useState(false)
  const [holdGoogleCred, setHoldGoogleCred] = useState({})
  const [sectionOrder, setSectionOrder] = useState(null)
  const [openMsg, setOpenMsg] = useState()
  const [orderObj, setOrderObj] = useState(null)
  const [returnStatement, setReturnStatement] = useState(null)
  const [textPrompt, setTextPrompt] = useState(null)
  const [askMsg, setAskMsg] = useState(null)
  const [client, setClient] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const currentCall = useRef();
  const [isJoiningChannel, setIsJoiningChannel] = useState(false);
  const socket = useRef()
  const remoteVideoTrack = useRef(null);
  const localVideoTrack = useRef(null)
  const remoteVideoElementRef = useRef(null);
  const localVideoElementRef = useRef(null)
  const gottenGroup = useRef(true)
  useEffect(() => {
    if (!userNameGet || userNameGet.profileId == "123" || userNameGet == {}) {
      navigate("/signup")
    }
    else {

    }
  }, [userNameGet])
  const cleanupCall = async () => {
    if (localTrack) {
      localTrack.close();
      setLocalTrack(null);
    }

    if (client) {
      await client.leave();
      setClient(null);
    }

    currentCall.current = null;
    setIncomingCall(null);
    setIsJoiningChannel(false);
    secCount.current = 0
    minCount.current = 0
    hourCount.current = 0
  };
  const endCall = () => {
    const user = JSON.parse(localStorage.getItem("TilChat"));
    const UserName = user?.UserName
    socket.current.emit("hangup", { to: currentCall.current?.from, from: UserName });
    cleanupCall();
  }
  const filterMutualRender = () => {
    console.log(mutualRender);
    if (mutualRender?.length == 0) {
      return
    }
    setMutualRender(prev => 
        prev.filter((item, index, self) => 
            index === self.findIndex(render => 
                (render?.UUID && render?.UUID === item?.UUID) || 
                (render?.UserName && render?.UserName === item?.UserName)
            )
        )
    )
  }
  useEffect(() => {
    if (userCredentials && mutualRender.length > 0 && gottenGroup.current) {
      gottenGroup.current = false
      get(ref(db, `usersGroup/${userCredentials?.UserName}`))
        .then((allGroup) => {
          const gottenData = allGroup.val()
          if (!gottenData) {
            filterMutualRender()
            return
          }
          console.log("gotten", gottenData);
          const obj = Object.keys(gottenData)
          obj.map(async (UUID) => {
            const checkGroupExisting = mutualRender.filter(group => group?.UUID == UUID)
            if (checkGroupExisting?.length === 0) {
              const getCred = await get(ref(db, `AllGroup/${UUID}`))
              console.log("here", getCred.val())
              if (getCred.val()) {
                setMutualRender(prev => [...prev, getCred.val()])
              }
            }
          })
          filterMutualRender()
        })
    }
  }, [userCredentials, mutualRender])

  useEffect(() => {
    if (userCredentials && mutualRender.length > 0) {
      const newGroup = onValue(ref(db, `NewGroup/${userCredentials?.UserName}`), (newGP) => {
        const gottenData = newGP.val()
        if (!gottenData) {
          return
        }
        console.log("gotten", gottenData);
        const obj = Object?.keys(gottenData)
        obj.map(async (UUID) => {
          const checkGroupExisting = mutualRender.filter(group => group?.UUID == UUID)
          if (checkGroupExisting?.length == 0) {
            const getCred = await get(ref(db, `AllGroup/${UUID}`))
            console.log("here", getCred.val())
            if (getCred.val()) {
              setMutualRender(prev => [...prev, getCred.val()])
            }
          }
        })
        filterMutualRender()
        set(ref(db, `NewGroup/${userCredentials?.UserName}`), null)
      })
      return newGroup
    }
  }, [userCredentials, mutualRender])
  return (
    <ViewStateContext.Provider value={{
      createGroup, setCreateGroup, 
      musicActive, setMusicActive, 
      isAwake, setIsAwake, 
      chat, setChat, 
      chatInfo, setChatInfo, 
      chatFriendDetail, setChatFriendDetail, 
      feedObject, setFeedObject, 
      userName, setUserName, 
      userCredentials, setUserCredentials, 
      chatState, setChatState, 
      showPermissionButton, setShowPermissionButton, 
      mutualRender, setMutualRender, 
      otherDevices, setOtherDevices, 
      deviceUserAgent, setDeviceUserAgent, 
      forwardArray, 
      triggerForward, setTriggerForward, 
      forwardCred, 
      triggerSend, setTriggerSend, 
      forwardChatInfo, 
      chatArray, setChatArray, 
      wallPaperArray, setWallPaperArray, 
      currentWallpaper, setCurrentWallpaper, 
      friendsWallpaper, setFriendsWallpaper, 
      userAbout, setUserAbout, 
      blockedArray, setBlockedArray, 
      archivedArray, setArchivedArray, 
      friendsBlocked, setFriendBlocked, 
      chatBlocked, setChatBlocked, 
      currentCallCred, setCurrentCallCred, 
      callAccepted, setCallAccepted, 
      callBlock, setCallBlock, 
      displayCallBlock, setDisplayCallBlock, 
      callActive, setCallActive, 
      currentCount, setCurrentCount,
      micActive, setMicActive,
      callChatInfo, setCallChatInfo,
      callType, setCallType,
      currentCallWallpaper, setCurrentCallWallpaper,
      secCount, minCount, hourCount, callTimerDown, timeCountTimer,
      currentIncomeCall, setCurrentIncomingCall,
      incomingCallMini, setIncomingCallMini,
      vibrationTone, ringTone,
      callAccept, setCallAccept,
      callAcceptTimer,
      callChatId, setCallChatId,
      callEndTimer,
      pickedCall, setPickedCall,
      callEnded, setCallEnded,
      checkRecieve, gotCalling,
      videoView, setVideoView,
      chatEdited, setChatEdited,
      holdGoogleCred, setHoldGoogleCred,
      sectionOrder, setSectionOrder,
      openMsg, setOpenMsg,
      orderObj, setOrderObj,
      returnStatement, setReturnStatement,
      textPrompt, setTextPrompt,
      askMsg, setAskMsg,
      client, setClient,
      localTrack, setLocalTrack,
      incomingCall, setIncomingCall,
      currentCall,
      isJoiningChannel, setIsJoiningChannel,
      socket, remoteVideoTrack, localVideoTrack, remoteVideoElementRef, localVideoElementRef,gottenGroup,
      cleanupCall, endCall
    }}>
      <Routes>
        <Route path='/dashboard' element={<Home ViewState={ViewState} setViewState={setViewState} iframeLink={iframeLink} setIframeLink={setIframeLink} />} >
        </Route>
          <Route path="/chat" element={<ChatDisplay secCount={secCount} minCount={minCount} hourCount={hourCount} chatEdited={chatEdited} setChatEdited={setChatEdited} localVideoTrack={localVideoElementRef} remoteVideoTrack={remoteVideoElementRef} setVideoView={setVideoView} videoView={videoView} cleanupCall={cleanupCall} handleEndCall={endCall} setCallEnded={setCallEnded} setCurrentIncomingCall={setCurrentIncomingCall} setCallChatId={setCallChatId} callTimerDown={callTimerDown} callEndTimer={callEndTimer} setCallType={setCallType} callType={callType} setCallChatInfo={setCallChatInfo} callChatInfo={callChatInfo} callActive={callActive} setCallActive={setCallActive} setMicActive={setMicActive} micActive={micActive} setCurrentCallWallpaper={setCurrentCallWallpaper} displayCallBlock={displayCallBlock} setDisplayCallBlock={setDisplayCallBlock} currentCount={currentCount} setCurrentCount={setCurrentCount} currentCallCred={currentCallCred} setCurrentCallCred={setCurrentCallCred} callAccepted={callAccepted} setCallAccepted={setCallAccepted} callBlock={callBlock} setCallBlock={setCallBlock} friendsBlocked={friendsBlocked} setFriendBlocked={setFriendBlocked} chatBlocked={chatBlocked} setChatBlocked={setChatBlocked} archivedArray={archivedArray} setArchivedArray={setArchivedArray} blockedArray={blockedArray} setBlockedArray={setBlockedArray} friendsWallpaper={friendsWallpaper} setFriendsWallpaper={setFriendsWallpaper} wallPaperArray={wallPaperArray} setWallPaperArray={setWallPaperArray} currentWallpaper={currentWallpaper} setCurrentWallpaper={setCurrentWallpaper} chatArray={chatArray} setChatArray={setChatArray} forwardChatInfo={forwardChatInfo} setTriggerSend={setTriggerSend} triggerSend={triggerSend} forwardCred={forwardCred} setTriggerForward={setTriggerForward} forwardArray={forwardArray} userCredentials={userCredentials} deviceUserAgent={deviceUserAgent} otherDevices={otherDevices} mutualRender={mutualRender} setMutualRender={setMutualRender} setChatState={setChatState} chatState={chatState} setChatInfo={setChatInfo} chatInfo={chatInfo} setChatFriendDetail={setChatFriendDetail} chatFriendDetail={chatFriendDetail}/>} />
          <Route path="/View" element={<View chatState={chatState} setChatState={setChatState} userCredentials={userCredentials} setViewState={setViewState} ViewState={ViewState} iframeLink={iframeLink} setIframeLink={setIframeLink} setChatInfo={setChatInfo} feedObject={feedObject} setFeedObject={setFeedObject} setChat={setChat}/>} />
          <Route path='/menu' element={<SideComponents setCreateGroup={setCreateGroup} setAskMsg={setAskMsg} openMsg={openMsg} setOpenMsg={setOpenMsg} setReturnStatement={setReturnStatement} sectionOrder={sectionOrder} setSectionOrder={setSectionOrder} setIsAwake={setIsAwake} isAwake={isAwake} chatBlocked={chatBlocked} setChatBloceeked={setChatBlocked} archivedArray={archivedArray} setArchivedArray={setArchivedArray} friendsWallpaper={friendsWallpaper} currentWallpaper={currentWallpaper} chatArray={chatArray} setChatArray={setChatArray} forwardChatInfo={forwardChatInfo} deviceUserAgent={deviceUserAgent} otherDevices={otherDevices} chatState={chatState} chatInfo={chatInfo} chatFriendDetail={chatFriendDetail} wallPaperArray={wallPaperArray} setWallPaperArray={setWallPaperArray} setCurrentWallpaper={setCurrentWallpaper} setTriggerSend={setTriggerSend} triggerForward={triggerForward} forwardArray={forwardArray} mutualRender={mutualRender} setMutualRender={setMutualRender} setChatState={setChatState} userCredentials={userCredentials} setViewState={setViewState} ViewState={ViewState} setIframeLink={setIframeLink} setChatView={setChat} setChatInfo={setChatInfo} setChatFriendDetail={setChatFriendDetail} feedObject={feedObject} setFeedObject={setFeedObject}/>}/>
        <Route path='/' element={<Navigate to='/dashboard' />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/signupproceed' element={<SIgnUpProceed />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path="/sendBlog" element={<BlogSend />} />
        <Route path='/login' element={<Navigate to='/signin' />} />
        {/* <Route path='*' element={<SignUp />} /> */}
      </Routes>
    </ViewStateContext.Provider>
  )
}

export default App