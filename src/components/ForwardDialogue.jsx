import React, { useRef } from 'react'
import userImg from "../images/user.png"
import "../Styles/ForwardDialogue.css"



const ForwardDialogue = ({mutualRender, state, forwardArray, setTriggerForward, forwardCred}) => {
    const chooseUser = (e, userName) =>{
        const btn = e.target
        if (btn.className == "choosed") {
            btn.className = "choose"
            const removeUser = forwardArray.current.filter(user=> user != userName)
            forwardArray.current = removeUser
        }
        else{
            forwardArray.current.push(userName)
            btn.className = "choosed"
        }
    }

    const cancelForward = () =>{
        state(false)
    }

    const forwardChat = () =>{
        if (forwardArray.current.length > 0) {
            setTriggerForward(true)
            state(false)
        }
    }
    
    return (
        <div className='forwardOverAll'>
                <div className="parentBtn">
                    <button onClick={cancelForward}>Cancel</button>
                    <button onClick={forwardChat}>send</button>
                </div>
                <input type="text" placeholder='search' />
            <div className="forwardParent">
                {
                    mutualRender.map((output, index)=>{
                        if (output.UserName) {
                            return(
                                <div className='chat' key={index} >
                                    <img src={output?.profilePic == "/src/images/user.png" || output?.profilePic == "/assets/user.png"? userImg: output?.profilePic} alt="" />
                                    <div style={{display:"flex",flexDirection:"column"}}>
                                        <p>{output?.FullName}</p>
                                        <small style={{color:'whitesmoke'}}>@{output?.UserName}</small>
                                        {output?.unreadMsg? <main className='unread'></main>: null}
                                    </div>
                                    <div className="choose" onClick={(e)=>chooseUser(e,output?.UserName)}></div>
                                </div>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}

export default ForwardDialogue
