import React, { useState } from 'react'
import '../Styles/PreviewMedia.css'
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import more from "../images/more.png"


const PreviewMedia = (props) => {
    const [moreOption, setMoreOption] = useState(false)
    const closePreview = () =>{
      props.setPreviewMedia(() =>false)
    }
    const showOption = () =>{

      if (moreOption) {
            setMoreOption(()=>false)
      }
      else{
          setMoreOption(()=>true)
      }
    }
    const downloadMedia = async () => {
    try {
      const response = await fetch(props.previewSrc);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = props.previewType === 'image' ? 'jpg' : 'mp4';
      
      a.download = `Tilchat-media.${extension}`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
};
  return (
    <div className='PreviewMedia'>
        <img src={close} alt="" className='close' onClick={closePreview}/>
        <img src={more} alt="" className='moreOption' onClick={showOption}/>
        <div className="optionList" style={moreOption?{display:"flex"}: {display:"none"}}>
            <div className="option" onClick={downloadMedia}><p>Download</p></div>
        </div>
        {props.previewType == "video"?<video src={props.previewSrc} controls></video>: <img src={props.previewSrc} className='previewImg'></img>}
    </div>
  )
}

export default PreviewMedia
