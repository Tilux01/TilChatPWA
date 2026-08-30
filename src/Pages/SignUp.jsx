import React, { useState } from 'react'
import "./Styles/SignUp.css"
import bg from "../images/wallpaper10.png"
import Google from "../images/search (2).png"
import github from "../images/github (1).png"
import mail from "../images/gmail.png"
import { useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {app, db} from '../firebase/config'
import {ref,set,get, orderByChild, update,startAt,endAt,query} from "firebase/database"




// Usage example:


const SignUp = () => {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate()
  const [signOption, setSignOption] = useState(true)
  const navigateT0 = (param) =>{
    navigate(`/${param}`)
  }
  const login = () =>{
    navigate("/signin")
  }
  const googleSIgn = async() =>{
      const auth = getAuth();
      signInWithPopup(auth, provider)
      .then(async(result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log(user);
        const mailQuery = query(
            ref(db, "Users"),
            orderByChild("_search/email"),
            startAt(user.email),
            endAt(user.email)
        );
        const [mailSnapshot] = await Promise.all([
            get(mailQuery)
        ]);
        if (mailSnapshot.exists()) {
          alert("Email already exist, please proceed to log in")
        }
        else{
          fetch(user.photoURL)
          .then(res => res.blob())
          .then((blobLog)=>{
            const fileReader = new FileReader()
            fileReader.addEventListener("load",((e)=>{
              const base64 = e.target.result
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
              // const allCred ={ 
              //   FullName: user.displayName,
              //   Email: user.email,
              //   UserName: null,
              //   profilePic: user?.photoURL,
              //   city: null,
              //   gender: null,
              //   DOB: null,
              //   Password,
              //   uniqueId,
              //   profileId,
              //   mutualFriends: [UserName],
              //   friendsArray:[{userName:"admin",Validate:true}],
              //   _search: {
              //     fullName: user.displayName.toLowerCase(),
              //     userName: null,
              //     email: user.email,
              //     type: {type:[]},
              //     readReceipt: true
              //   }
              // }
            }))
            fileReader.readAsDataURL(blobLog)
          })
        }
      })
      .catch((error) => {
        console.log(error);
        const errorCode = error?.code;
        const errorMessage = error?.message;
        const email = error?.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      })
    }
    return (
      <div className="signup-overall">
        {signOption? <section>
          <img src={bg} className='bg' alt="" />
          <div className="sign-dialogue">
            <h1>Welcome!</h1>
            <div className="option">
              <p>Choose a sign in option</p>
              <div className="mt-p">
                <div className="mt" onClick={googleSIgn}>
                  <img src={Google} alt="" />
                  <p>Sign Up with Google</p>
                </div>
                <div className="mt">
                  <img src={github} alt="" className='github'/>
                  <p>Sign Up with Github</p>
                </div>
              </div>
            </div>
            <div className="or-p">
              <div className="l"></div>
              <p>OR</p>
              <div className="l"></div>
            </div>
            <div className="option option-l">
              <div className="mt-p" onClick={()=>{navigateT0("signupproceed")}}>
                <div className="mt">
                  <img src={mail} alt="" />
                  <p>Sign Up with Mail</p>
                </div>
              </div>
            </div>
            <h6 onClick={login} >Already have an account? sign in</h6>
          </div>
        </section> : null}
      </div>
    )
  }
export default SignUp
