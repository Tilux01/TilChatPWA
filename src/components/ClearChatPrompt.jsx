import React from 'react'
import cancelBtn from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"

const ClearChatPrompt = ({setClearChatPrompt, setClearChatReturn}) => {
    const handleClick = () =>{
        setClearChatReturn(true)
        setClearChatPrompt(false)
    }
    const cancelPrompt = () =>{
        setClearChatPrompt(false)
    }
  return (
    <div>
      <div className='deleteDialogue'>
            <div className="deleteParent">
                <img onClick={()=>{cancelPrompt("cancel")}} src={cancelBtn} alt="" />
                <p>Do you want to clear this chat? This action is irrevokable</p>
                <div className="btnParent">
                    <button onClick={handleClick}>Yes</button>
                    <button onClick={cancelPrompt}>No</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ClearChatPrompt
