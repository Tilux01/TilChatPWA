import React, { useEffect, useReducer, useRef, useState } from 'react'
import "../Styles/Settings.css"
import userImg from "../images/user.png"
import downArrow from "../images/left-arrow-white.png"
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import addBtn from "../images/add.png"



export const ProfiileView = (props) => {
    const [optionMenu, setOptionMenu] = useState(null)
    
    const changeOption =(param)=>{
        if (optionMenu == param) {
            setOptionMenu(null)
        }
        else{
            setOptionMenu(param)
        }
    }

    const closePreview = () =>{
        props.state(false)
    }

    const setWallpaper = (output) =>{
        const filterUser = props.friendsWallpaper.filter(wallpaper=> wallpaper[Object?.keys(wallpaper)[0]] == props.userCredentials.UserName)
        filterUser.push({[props.userCredentials.UserName]:output})
        // console.log(filterUser);
        props.setFriendsWallpaper(filterUser)
        return
    }

    const addWallpaper = (e) =>{
        const file = e.target.files[0]
        console.log(file);
        const reader = new FileReader()
        reader.addEventListener("load",(e)=>{
            const base64 = e.target.result
            props.setWallPaperArray(prev=> [...prev, base64])
            file.value = null
        })
        reader.readAsDataURL(file)
    }
  return (
    <div className='settings-overall profile-overall' >
        <img className='closeBtn' onClick={closePreview} src={close} alt="" />
        <h1></h1>
                <div className="scrollParent">
                    <div className="profilePreview">
                        <div className="imagePrev">
                                <img src={props.userCredentials.profilePic == "/src/images/user.png" || props.userCredentials.profilePic == "/assets/user.png"? userImg: props.userCredentials.profilePic} alt="" className='profileImg'/>
                        </div>
                        <p>{props.userCredentials.FullName}</p>
                        <h6>@{props.userCredentials.UserName}</h6>
                        <h6 className='profession'>Software Engineer</h6>
                    </div>
                    <div className="breakLine"></div>
                    <h6 className='bio'>"{props?.userCredentials?.about}"</h6>
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
                                        <p>{props.userCredentials.FullName}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="creden">
                                        <h3>Mail</h3>
                                        <p>{props.userCredentials.Email}</p> 
                                    </div>
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
                                        <p>{props.userCredentials.city}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div className="option-start" onClick={()=>changeOption('wallpaper')}>
                                    <p>Wallpapers</p>
                                    <img style={optionMenu == "privacy"? {transform:"rotate(90deg)"} : {transform:"rotate(-90deg)"}} src={downArrow} alt="" className='down-arrow'/>
                            </div>
                            <div style={optionMenu == "wallpaper"? {display:"flex"} : {display:"none"}} className="other-option">
                                <div className='wallpaperOverall'>
                                {
                                    props.wallPaperArray.map((output)=>{
                                        if (output == props.currentWallpaper) {
                                            return(
                                                <div className='wallpaperParent border' onClick={()=>{setWallpaper(output)}}>
                                                    <img src={output} alt="" />
                                                </div>
                                            )
                                        }
                                        else{
                                            return(
                                                <div className='wallpaperParent' onClick={()=>{setWallpaper(output)}}>
                                                    <img src={output} alt="" />
                                                </div>
                                            )
                                        }
                                    })
                                }
                                <input type="file" onChange={(e)=>{addWallpaper(e)}} style={{display:"none"}} accept='image/*' name='uploadWallpaper' id='uploadWallpaper' />
                                <div className="addWallpaperBtn">
                                    <label htmlFor="uploadWallpaper">
                                        <img src={addBtn} alt="" />
                                    </label>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
}
