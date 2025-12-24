import React, { useState } from 'react'
import "./Styles/SignUp.css"
import github from "../images/github (1).png"
import Tilux from "../images/social.png"
import Google from "../images/search (2).png"
import name from "../images/user.png"
import email from "../images/download-file.png"
import edit from "../images/pen.png"
import passwordImg from "../images/padlock.png"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,update,set,get} from "firebase/database"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
import {reduceImageQualityToBase64} from "../ImageConverter"



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



// Usage example:


const SignUp = () => {
    const navigate = useNavigate()
    const [FullName, setFullName] = useState("")
    const [Email, setEmail] = useState("")
    const [UserName, setUserName] = useState("")
    const [city, setCity] = useState("")
    const [DOB, setDOB] = useState("")
    const [gender, setGender] = useState("")
    const [Password, setPassword] = useState("")
    const [fullInfo, setFullInfo] = useState(false)
    const [profilePic, setProfilePic] = useState(name)
    const FullNameCheck = (e) =>{
        setFullName(F=>e.target.value)
    }
    const EmailCheck = (e) =>{
        setEmail(E=>e.target.value)
    }
    const UserNameCheck = (e) =>{
        setUserName(U=>e.target.value)
    }
    const checkFemale = (e) =>{
      document.getElementById("female").checked = false
      setGender("female")
    }
    const checkMale = () =>{
      document.getElementById("male").checked = false
      setGender("male")
    }
    const cityCheck = (e) =>{
        setCity(C=>e.target.value)
    }
    const DOBCheck = (e) =>{
        setDOB(D=>e.target.value)
    }
    const PasswordCheck = (e) =>{
        setPassword(P=>e.target.value)
    }
    const imgUpload = async(e) =>{
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 3008961) {
        alert("image size is too big")
        return
      }
      
      try {
        const reducedQualityBase64 = await reduceImageQualityToBase64(file, 0.5, 1024, 1024);
        setProfilePic(reducedQualityBase64.base64)
      } catch (error) {
        alert("error, invalid image")
      }
    }
    const changeInfo = (e) =>{
      // e.target.setAttribute("disabled"=/="true")
      if(!FullName){
        alert("Full name is required")
      }
      else if(!FullName.match(/[A-Za-z]{3,}\s[A-Za-z]{3,}/)){
        alert("Write your full name")
      }
      else if(!Email){
        alert("Email is required")
      }
      else if(!Email.match(/^[A-Za-z0-9\-_]{2,}@[A-Za-z]{2,}(\.[A-Za-z]{2,})+$/)){
        alert("Invalid email")
      }
      else if(!UserName){
        alert("Username is required")
      }
      else if(!UserName.match(/^[a-z0-9]{2,}$/)){
        alert("Username can only contain lowercase and numbers with minimum of two characters")
      }
      else if(gender == ""){
        alert("Pls select gender")
      }
      else{
        e.target.innerHTML = `
        <div></div>
        <div></div>
        <div></div>
      `
        get(ref(db,"Users/"+UserName))
        .then((Query)=>{
          if (Query.exists()) {
            alert("Username already exist, pls use a different username")
          }
          else{
            setFullInfo(true)
          }
          e.target.innerHTML = `proceed`
        })
        .catch((err)=>{
          console.log(err);
          
        })
      }
    }
    const Submit = (e) =>{
      const dateCheck = DOB[0] + DOB[1] + DOB[2] + DOB[3]
      const Year = new Date
      const currentYear = Year.getFullYear()
      const subtractYear = currentYear - dateCheck
      const PasswordUppercase = /[A-Z]{1,}/
      const passwordLowercase = /[a-z]{3,}/
      const passwordNumerals = /[0-9]{2,}/
      const passwordSyntax = /[!@#\$%\^&*_\-+=;(){}'.<>]{1,}/
      if (!city) {
        alert("Input your city name")
      }
      else if (!DOB) {
        alert("Pls set your date of birth")
      }
      else if(subtractYear < 18){
        alert("Only year of 17 and more are allowed")
      }
      else if(!(PasswordUppercase.test(Password) && passwordLowercase.test(Password) && passwordNumerals.test(Password) && passwordSyntax.test(Password) && Password.length > 8)){
        alert("Weak password, ensure to use minimum of 8 characters, uppercase, lowercase, numbers and special chracters")
      }
      else{
        if (!window.clientInformation.onLine) {
          alert("Pls connect to internet")
        }
        else{
          e.target.innerHTML = `
          <div></div>
          <div></div>
          <div></div>
          `
          try {
                const uniques = "1234567890abcdefghijklmnopqrstuvwxyz"
                let profileId = "Til"
                let uniqueId = ""
                for (let index = 0; index < 8; index++) {
                  const i = Math.floor(Math.random()*uniques.length)
                  uniqueId += uniques[i]
                }
                for (let index = 0; index < 8; index++) {
                  const i = Math.floor(Math.random()*uniques.length)
                  profileId += uniques[i]
                }
                set(ref(db,"Users/"+UserName.toLocaleLowerCase()),{
                    FullName,
                    Email,
                    UserName:UserName.toLocaleLowerCase(),
                    profilePic,
                    city,
                    gender,
                    DOB,
                    Password,
                    uniqueId,
                    profileId,
                    mutualFriends: [UserName],
                    friendsArray:[{userName:"admin",Validate:true}],
                    _search: {
                    fullName: FullName.toLowerCase(),
                    userName: UserName.toLowerCase(),
                    type: {type:[]},
                    readReceipt: true
                  }
                })

                let devices = []
                const userAgent = navigator.userAgent     
                devices.push(userAgent)
                update(ref(db, `Devices`),{
                  [UserName.toLowerCase()] : devices
                })
                
                localStorage.setItem("TilChat",JSON.stringify({UserName,uniqueId,profileId, profilePic}))
                alert("welcome " + UserName)
                navigate("/")
              } catch (error) {
                e.target.innerHTML = `proceed`
                alert("Error saving credentials, pls try again later")
              }
            }
      }
    }

    const login = () =>{
      localStorage.setItem("TilChat",JSON.stringify({UserName: "New",uniqueId: "123",profileId: "123", profilePic:"p"}))
      navigate("/signin")
    }
  return (
    <div className='signup-parent'>
      <div className="sign-overall">
        <div className="info">
          <h1>Welcome back to Tilchat</h1>
          <p>Already have an account?</p>
          <button>SIGN IN</button>
        </div>
        {!fullInfo?(
          <div className="form firstInfo">
            <h1>Create Account</h1>
            <div className="auto-log">
              <img src={Google} alt="" />
              <img src={github} alt="" />
              <img src={Tilux} alt="" />
            </div>
            <div className="input">
              <img src={name} alt="" />
              <input type="text" placeholder='Full Name' value={FullName} onChange={FullNameCheck}/>
            </div>
            <div className="input">
              <img src={email} alt="" />
              <input type="text" placeholder='example@gmail.com' value={Email} onChange={EmailCheck}/>
            </div>
            <div className="input">
              <img src={passwordImg} alt="" />
              <input type="text" placeholder='username' value={UserName} onChange={UserNameCheck}/>
            </div>
            <div className="gender">
              <label  htmlFor="female">male</label>
              <input onChange={checkMale} type="checkbox" id='female'/>
              <label htmlFor="male">Female</label>
              <input onChange={checkFemale} type="checkbox" id='male'/>
            </div>
            <button onClick={changeInfo}>Proceed</button>
            <h6 onClick={login} style={{color:"blue", cursor:"pointer"}}>Already have an account? sign in</h6>
          </div>
        ):(
          <div className="form lastInfo">
            <h1>Complete Your Profile</h1>
            <div className="upload">
              <div>
                <img src={profilePic} className='profileImg' alt="" />
                <label htmlFor="upload">
                  <img src={edit} alt="" className='edit'/>
                </label>
              </div>
              <input type="file" accept='image/*' onChange={imgUpload} id='upload' name='upload' style={{display:"none"}}/>
            </div>
            <div className="input">
              <img src={name} alt="" />
              <input type="text" placeholder='City' value={city} onChange={cityCheck}/>
            </div>
            <div className="input">
              <img src={email} alt="" />
              <input type='date' placeholder='Date of birth' value={DOB} onChange={DOBCheck}/>
            </div>
            <div className="input">
              <img src={passwordImg} alt="" />
              <input type="password" placeholder='Password' value={Password} onChange={PasswordCheck}/>
            </div>
            <button onClick={Submit}>Sign Up</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SignUp
