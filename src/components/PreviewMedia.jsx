import React, { useState } from 'react'
import '../Styles/PreviewMedia.css'
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import more from "../images/more.png"


const PreviewMedia = (props) => {
    const [option, setOption] = useState(false)
    const closePreview = () =>{
      props.setPreviewMedia(() =>false)
    }
    const showOption = () =>{

    }
  return (
    <div className='PreviewMedia'>
        <img src={close} alt="" className='close' onClick={closePreview}/>
        <img src={more} alt="" className='option'/>
        <select name="" id="">
          <option value="download">Download</option>
        </select>
        {props.previewType == "video"?<video src={props.previewSrc} controls></video>: <img src={props.previewSrc}></img>}
    </div>
  )
}

export default PreviewMedia
