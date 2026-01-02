import React, { useEffect, useReducer, useRef, useState } from 'react'
import "../Styles/Settings.css"
import userImg from "../images/user.png"
import editImg from "../images/pen.png"
import downArrow from "../images/left-arrow-white.png"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey, update} from "firebase/database"
import {reduceImageQualityToBase64} from "../ImageConverter"
import { useNavigate } from 'react-router-dom'
import loader from "../images/loading.png"




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

const Settings = (props) => {
    const navigate = useNavigate()
    const [optionMenu, setOptionMenu] = useState(null)
    const [profilePhotoList, setProfilePhotoList] = useState(false)
    const [profilePhotoSelected, setProfilePhotoSelected] = useState("Everyone")
    const [statusList, setStatusList] = useState(false)
    const [StatusSelected, setStatusSelected] = useState("Everyone")
    const [editName, setEditName] = useState(false)
    const [nameValue, setNameValue] = useState(props.userCredentials.FullName)
    const [VirtualNameValue, setVirtualNameValue] = useState(nameValue)
    const [editMail, setEditMail] = useState(false)
    const [mailValue, setMailValue] = useState(props.userCredentials.Email || "update@yourmail.com")
    const [VirtualMailValue, setVirtualMailValue] = useState(mailValue)
    const profileImgUpdate = useRef()
    const [location, setLocation] = useState("")
    const [readReceipt, setReadReceipt] = useState(true)
    const [backupActive, setBackupActive] = useState(false)
    const [loadProgress, setLoadProgess] = useState(null)

    const getLocationByIP = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            setLocation(data.country_name)
        } catch (error) {
            console.error('IP location error:', error);
            return null;
        }
    };

    useEffect(() => {
        getLocationByIP()
    }, [])

    useEffect(() => {
        setNameValue(props.userCredentials.FullName)
        setVirtualNameValue(props.userCredentials.FullName)
        setReadReceipt(props.userCredentials.readReceipt)
    }, [props.userCredentials])

    const changeOption =(param)=>{
        if (optionMenu == param) {
            setOptionMenu(null)
        }
        else{
            setOptionMenu(param)
        }
    }

    const profileShowList = () =>{
        if (!profilePhotoList) {
            setProfilePhotoList(true)
        }
        else{
            setProfilePhotoList(false)
        }
    }

    const selectedProfileShow = (param) =>{
        if (param) {
            setProfilePhotoSelected(param)
        }
    }

    const StatusShowList = () =>{
        if (!statusList) {
            setStatusList(true)
        }
        else{
            setStatusList(false)
        }
    }

    const selectedStatusShow = (param) =>{
        if (param) {
            setStatusSelected(param)
        }
    }

    const showEditName = () =>{
        setEditName(true)
    }

    const saveEditName = () =>{
        if (!VirtualNameValue) {
            alert("full name is required")
            return
        }
        if(!VirtualNameValue.match(/[A-Za-z]{3,}\s[A-Za-z]{3,}/)){
            alert("Write your full name")
            return
        }
        setEditName(false)
        if (nameValue != VirtualNameValue) {
            setNameValue(VirtualNameValue)
            update(ref(db, `Users/${props.userCredentials.UserName}`),{
                FullName: VirtualNameValue
            })
            .then(()=>{
                alert("Name updated successfully")
            })
        }
    }

    const showEditMail = () =>{
        setEditMail(true)
    }

    const saveEditMail = () =>{
        if (!VirtualMailValue) {
            alert("full name is required")
            return
        }
        if(!VirtualMailValue.match(/^[A-Za-z0-9\-_]{2,}@[A-Za-z]{2,}(\.[A-Za-z]{2,})+$/)){
            alert("Invalid mail")
            return
        }
        setEditMail(false)
        if (mailValue != VirtualMailValue) {
            setMailValue(VirtualMailValue)
            update(ref(db, `Users/${props.userCredentials.UserName}`),{
                Email: VirtualMailValue
            })
            .then(()=>{
                alert("Mail updated successfully")
            })
        }
    }

    const updatePic = async() =>{
        const file = profileImgUpdate.current.files[0]
        if (!file) return;
        if (file.size > 3008961) {
            alert("image size is too big")
            return
        }
        
        try {
            const reducedQualityBase64 = await reduceImageQualityToBase64(file, 0.5, 1024, 1024);
            if (reducedQualityBase64.base64 == props.userCredentials.profilePic) {
                alert("guy")
                return
            }
            update(ref(db, `Users/${props.userCredentials.UserName}`),{
                profilePic: reducedQualityBase64.base64
            })
            .then(()=>{
                alert("Profile image updated successfully")
            })
            
        } catch (error) {
            alert("error, invalid image")
        }
    }

    const changeReceipt = (e)=>{
        if (readReceipt) {
            setReadReceipt(false)
            update(ref(db, `Users/${props.userCredentials.UserName}`),{
                readReceipt: false
            })
        }
        else{
            setReadReceipt(true)
            update(ref(db, `Users/${props.userCredentials.UserName}`),{
                readReceipt: true
            })
        }
    }

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

    const logOut = () =>{
        saveChat("friendsList", null)
        localStorage.removeItem("TilChat")
        let devices = []
        get(ref(db, `Devices/${props.userCredentials.UserName}`))
        .then((output)=>{
            console.log(output.val());
            
            if (output.exists) {
                devices = output.val()
                const userAgent = navigator.userAgent  
                const filterDevice = devices.filter(device=> device != userAgent) 
                update(ref(db, `Devices`),{
                    [props.userCredentials.UserName] : filterDevice
                })
            }
        })
        .finally(()=>{
            const userAgent = navigator.userAgent  
            const sanitizeUser = sanitizeUserAgent(userAgent)
            set(ref,(db, `DevicesMessages/${props.userCredentials.UserName}/"${sanitizeUser}`))
        })
        navigate("/signup")
    }

    const openDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TilDB', 1)
            request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('chats')) {
                db.createObjectStore('chats')
            }
            }

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    const getAllKeys = async () => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('chats', 'readonly')
            const store = tx.objectStore('chats')
            const request = store.getAllKeys()
            request.onsuccess = () => resolve(request.result || [])
            request.onerror = () => reject(request.error)
        })
    }

    const getChat = async(key) =>{
            const db = await openDB()
            return new Promise((resolve, reject) => {
                const tx = db.transaction('chats', 'readonly')
                const store = tx.objectStore('chats')
                const request = store.get(key)
                request.onsuccess = () => resolve(request.result || null)
                request.onerror = () => reject(request.error)
            })
        }

    const  saveChat = async(directory, data) => {
    const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('chats', 'readwrite')
            const store = tx.objectStore('chats')
            store.put(data, directory)
            tx.oncomplete = () => resolve(true)
            tx.onerror = () => reject(tx.error)
        })
    }

    const backupArray = useRef([])
    const backUp = () =>{
        setLoadProgess("Backing up, pls wait...")
        getAllKeys()
        .then((data)=>{
            data.map((output)=>{
                if (output != "") {
                    getChat(output)
                    .then((dataOut)=>{
                        if (dataOut && dataOut.length > 0) {
                            backupArray.current.push({[output]: dataOut})
                        }
                    })
                }
            })
            backupArray.current.map((value)=>{
                const DBKeys = Object.keys(value)[0]
                setLoadProgess("Backing up, pls wait...")
                value[DBKeys].map((result, index)=>{
                    update(ref(db, `Backup/${props.userCredentials.UserName}/${DBKeys}/`),{
                        [index] : result
                    })
                    .then(()=>{
                        backupArray.current = []
                        setBackupActive(false)
                    })
                })
            })
            setLoadProgess("Done")
            setLoadProgess(null)
            // setBackupActive(true)
            // if (backupArray.current && backupArray.current.length > 0) {
            // }
        })
        .finally(()=>{
        })
    }

    const restoreBackup = () =>{
        setLoadProgess("Restoring backup, pls wait...")
        get(ref(db, `Backup/${props.userCredentials.UserName}`))
        .then((backup)=>{
            if (backup.exists()) {      
                const backupList = [Object.entries(backup.val())]
                const convertedArray = []
                backupList[0].map((output, index)=>{
                    const listObj = {[output[0]]: output[1]}
                    convertedArray.push(listObj)
                })
                convertedArray.map((output)=>{
                    const key =  Object.keys(output)[0]
                    saveChat(key, output[key])
                })
            }
            
        })
        .finally(()=>{
            backupArray.current.map((value)=>{
                const DBKeys = Object.keys(value)[0]
                value[DBKeys].map((result, index)=>{
                    update(ref(db, `Backup/${props.userCredentials.UserName}/${DBKeys}/`),{
                        [index] : null
                    })
                    .then(()=>{
                        backupArray.current = []
                        setBackupActive(false)
                    })
                    .finally(()=>{
                        setLoadProgess(null)
                    })
                })
                alert("done")
            })
        })
    }
    return (
        <div className='settings-overall' >
            <h1>Settings</h1>
            <div className="scrollParent" style={loadProgress? {pointerEvents:"none", filter:"brightness(.7) blur(1px)"} : null}>
                <div className="profilePreview">
                    <input ref={profileImgUpdate} onChange={updatePic} style={{display:"none"}} type="file" name="profileImgUpload" id="profileImgUpload" accept='image/*'/>
                    <div className="imagePrev">
                            <img src={props.userCredentials.profilePic == "/src/images/user.png" || props.userCredentials.profilePic == "/assets/user.png"? userImg: props.userCredentials.profilePic} alt="" className='profileImg'/>
                            <label htmlFor="profileImgUpload">
                                <img src={editImg} alt="" className="editIcon" />
                            </label>
                    </div>
                    <p>{props.userCredentials.FullName}</p>
                    <h6>{props.userCredentials.UserName}</h6>
                </div>
                <div className="breakLine"></div>
                <div className="options-parent">
                    <div className="">
                        <div className="option-start" onClick={()=>changeOption('personal info')}>
                                <p>Personal Info</p>
                                <img style={optionMenu == "personal info"? {transform:"rotate(90deg)"} : {transform:"rotate(-90deg)"}} src={downArrow} alt="" className='down-arrow'/>
                        </div>
                        <div style={optionMenu == "personal info"? {display:"flex"} : {display:"none"}} className="other-option">
                            <div>
                                <div className="creden">
                                    <h3>Name</h3>
                                    {editName? <input onChange={(e)=>{setVirtualNameValue(e.target.value)}} type='text' value={VirtualNameValue}/> : <p>{nameValue}</p>} 
                                </div>
                                {
                                    editName?
                                        <div className="editBtn" style={{background:"green"}} onClick={saveEditName}>
                                            <h6>Save</h6>
                                        </div>:
                                    <div className="editBtn" onClick={showEditName}>
                                        <img src={editImg} alt="" />
                                        <h6>Edit</h6>
                                    </div>
                                }
                            </div>
                            <div>
                                <div className="creden">
                                    <h3>Mail</h3>
                                    {editMail? <input onChange={(e)=>{setVirtualMailValue(e.target.value)}} type='text' value={VirtualMailValue}/> : <p>{mailValue}</p>} 
                                </div>
                                {
                                    editMail?
                                        <div className="editBtn" style={{background:"green"}} onClick={saveEditMail}>
                                            <h6>Save</h6>
                                        </div>:
                                    <div className="editBtn" onClick={showEditMail}>
                                        <img src={editImg} alt="" />
                                        <h6>Edit</h6>
                                    </div>
                                }
                            </div>
                            <div>
                                <div className="creden">
                                    <h3>DOB</h3>
                                    <p>{props.userCredentials.DOB}</p>
                                </div>
                            </div>
                            <div>
                                <div className="creden">
                                    <h3>Location</h3>
                                    <p>{location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div className="option-start" onClick={()=>changeOption('privacy')}>
                                <p>Privacy</p>
                                <img style={optionMenu == "privacy"? {transform:"rotate(90deg)"} : {transform:"rotate(-90deg)"}} src={downArrow} alt="" className='down-arrow'/>
                        </div>
                        <div style={optionMenu == "privacy"? {display:"flex"} : {display:"none"}} className="other-option">
                            <div>
                                <div className="creden">
                                    <p>Profile photo</p>
                                </div>
                                <div className='select'>
                                    <div className="select option-start" onClick={profileShowList}>
                                        <p>{profilePhotoSelected}</p>
                                        <img style={profilePhotoList? {transform:"rotate(90deg)"} : {transform:"rotate(-90deg)"}} src={downArrow} alt="" className='down-arrow'/>
                                    </div>
                                    <div style={profilePhotoList? {display:"flex"} : {display:"none"}} className="small-opt other-option">
                                        <div onClick={()=>{selectedProfileShow("Everyone")}}>
                                            <div className="creden">
                                                <h3>Everyone</h3>
                                            </div>
                                        </div>
                                        <div onClick={()=>{selectedProfileShow("Selected")}}>
                                            <div className="creden">
                                                <h3>Selected</h3>
                                            </div>
                                        </div>
                                        <div onClick={()=>{selectedProfileShow("All Except")}}>
                                            <div className="creden">
                                                <h3>All Except</h3>
                                            </div>
                                        </div>
                                        <div onClick={()=>{selectedProfileShow("None")}}>
                                            <div className="creden">
                                                <h3>None</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="creden">
                                    <p>Last seen</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <div>
                                <div className="creden">
                                    <p>Status</p>
                                </div>
                                <div className='select'>
                                    <div className="select option-start" onClick={StatusShowList}>
                                        <p>{StatusSelected}</p>
                                        <img style={statusList? {transform:"rotate(90deg)"} : {transform:"rotate(-90deg)"}} src={downArrow} alt="" className='down-arrow'/>
                                    </div>
                                    <div style={statusList? {display:"flex"} : {display:"none"}} className="small-opt other-option">
                                        <div onClick={()=>{selectedStatusShow("Everyone")}}>
                                            <div className="creden">
                                                <h3>Everyone</h3>
                                            </div>
                                        </div>
                                        <div onClick={()=>{selectedStatusShow("Selected")}}>
                                            <div className="creden">
                                                <h3>Selected</h3>
                                            </div>
                                        </div>
                                        <div onClick={()=>{selectedStatusShow("All Except")}}>
                                            <div className="creden">
                                                <h3>All Except</h3>
                                            </div>
                                        </div>
                                        <div onClick={()=>{selectedStatusShow("None")}}>
                                            <div className="creden">
                                                <h3>None</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="creden">
                                    <p>Read Receipt</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" onClick={(e)=>{changeReceipt(e)}} checked={readReceipt}/>
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div className="option-start" onClick={()=>changeOption('security')}>
                                <p>Security</p>
                                <img style={optionMenu == "security"? {transform:"rotate(90deg)"} : {transform:"rotate(-90deg)"}} src={downArrow} alt="" className='down-arrow'/>
                        </div>
                        <div style={optionMenu == "security"? {display:"flex"} : {display:"none"}} className="other-option">
                            <div>
                                <div className="creden">
                                    <p>Show Security Notification</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div className="option-start" onClick={()=>changeOption('help')}>
                                <p>Help</p>
                                <img style={optionMenu == "help"? {transform:"rotate(90deg)"} : {transform:"rotate(-90deg)"}} src={downArrow} alt="" className='down-arrow'/>
                        </div>
                        <div style={optionMenu == "help"? {display:"flex"} : {display:"none"}} className="other-option">
                            <div>
                                <div className="creden">
                                    <p>FAQs</p>
                                </div>
                            </div>
                            <div>
                                <div className="creden">
                                    <p>Contact</p>
                                </div>
                            </div>
                            <div>
                                <div className="creden">
                                    <p>Terms & Privacy policy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className='log-out-btn' onClick={backUp} disabled={backupActive}>Back Up</button>
                    <button className='log-out-btn' onClick={restoreBackup}>Restore Backup</button>
                    <button className='log-out-btn' onClick={logOut}>Log Out</button>
                </div>
            </div>
            {
                loadProgress?
                <div className="loader">
                    <img src={loader} alt="" />
                    <p>{loadProgress}</p>
                </div>
                : null
            }
        </div>
    )
}

export default Settings
