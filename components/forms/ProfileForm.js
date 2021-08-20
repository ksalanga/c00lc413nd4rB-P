import Image from 'next/image'
import defaultPic from '../../public/default.png'
import styles from '../../styles/profilepicture.module.css'
import {useState} from 'react'

export default function profileForm(props) {
    const [file, setFile] = useState()

    const profilePicture = props.user?.profilePic === undefined ? defaultPic : user.profilePic

    const onFileChange = event => {
        setFile(event.target.files[0])
    }

    return (
        <>
        <form style={{textAlign: "center"}}>
            <div className={styles.imageUpload}>
                <div className={styles.imageWrap}>
                <label for="file-input">
                    <Image src={profilePicture} width="200px" height="200px" className={styles.profileHover}></Image>
                    <div className={styles.imageDescriptionLayer}>
                        <p className={styles.imgeDescription}>Change Profile Picture</p>
                    </div>
                </label>
                </div>
                
                <input id="file-input" type="file" onChange={onFileChange}></input>
            </div>
            <h3 style={{textAlign: "center"}}>Hello, {props.user.username}</h3>
            <div>Change Username</div>
            <input type="text"></input>
            <div>Change Password</div>
            <input type="text"></input>
            <div>Old Password</div>
            <input type="text"></input>
            <br></br>
            <br></br>
            <input type="submit"></input>
        </form>
        </>
    )
}