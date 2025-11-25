import React, { useState,useEffect, useRef } from 'react'
import playBtn  from "../images/play-1073616_640.png"
import videoPreview from "../images/video.png"
import imagePreview from "../images/photo (1).png"


const MediaTypesSelect = ({type, data, setPreviewMedia, previewSrc, previewType, statusPreview}) =>{ 
        const preview = (data, type) =>{
            previewSrc.current = data
            previewType.current = type
            setPreviewMedia(true)
        }
        if(type == "image"){
            if(data){
                // const restoredUint8 = new Uint8Array(data);
                const blob = new Blob([data], { type: type });
                const url = URL.createObjectURL(blob);
                return (
                    <img src={url} alt="" onClick={()=>preview(url, type)}/>
                )
            }
            else{
                return (<img src={imagePreview} style={{filter:"brightness(.4)"}} alt="" />)
            }
        }
        else if(type == "video"){
            if(data){
                const blob = new Blob([data], { type: type });
                const url = URL.createObjectURL(blob);
                return (
                <div className='videoPreviewer' onClick={()=>preview(url, type)}>
                    <img src={statusPreview? null : playBtn} alt="" className='playBtn'/>
                    {statusPreview? <video src={url} controls></video> : <video src={url}></video>}
                </div>
                )
            }
            else{
                return (
                <img src={videoPreview} style={{filter:"brightness(.4) "}} alt="" />
                )
            }
        }
        else if(type == "audio/webm;codecs=opus"){
            
            if (data) {
                return(
                    <audio src={data} controls></audio>
                )
            }
        }
        // else{
        //     if(data){
        //         const blob = new Blob([data], { type: type });
        //         const url = URL.createObjectURL(blob);
        //         const docs = [{ url:url }];
        //         return (
        //         <div className='documentViewer'>
        //             <FileViewer
        //                 fileType={fileType.split("/").pop()} // e.g. pdf, txt, docx
        //                 filePath={url}
        //                 errorComponent={() => <div>Could not load document.</div>}
        //             />
        //         </div>
        //         )
        //     }
        //     else{
        //         return (
        //             <img src={videoPreview} style={{filter:"brightness(.4) "}} alt="" />
        //         )
        //     }
        // }
    }

export default MediaTypesSelect