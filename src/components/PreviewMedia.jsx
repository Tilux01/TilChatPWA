import React from 'react'
import '../Styles/PreviewMedia.css'
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"

const PreviewMedia = (props) => {
    
    const closePreview = () =>{
        props.setPreviewMedia(() =>false)
    }
  return (
    <div className='PreviewMedia'>
        <img src={close} alt="" className='close' onClick={closePreview}/>
        {props.previewType == "video"?<video src={props.previewSrc} controls></video>: <img src={props.previewSrc}></img>}
    </div>
  )
}

export default PreviewMedia
