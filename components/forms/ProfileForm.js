import Image from 'next/image'
import defaultPic from '../../public/default.png'
import styles from '../../styles/profilepicture.module.css'
import { useState } from 'react'

export default function profileForm(props) {
    const [form, setForm] = useState({user: props.user.id, username: '', newPassword: '', passwordConfirm: ''})
    const [file, setFile] = useState(null)
    const [fileURL, setFileURL] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)

    const checkSubmission = async () => {
        // On a multipart-form/data submission, do not include the Content-Type for multer since formData as a body forces that.
        var formSubmission = new FormData()

        for (var key in form) {
            formSubmission.append(key, form[key])
        }
        formSubmission.append('image', file)
        
        const response = await fetch('/api/users/edit', {
            method: 'POST',
            body: formSubmission
        })

        const message = await response.text()
    }

    const profilePicture = props.user.profilePic === undefined ? defaultPic : user.profilePic

    const onFileChange = event => {
        const file = event.target.files[0]

        if (!file) return

        // Receive errors from the API via multer
        if (file.type !== "image/png" && file.type !== "image/jpeg") {
            setErrorMessage('Wrong File Type')
            return
        }

        if (file.size > (5 * (10**5))) {
            setErrorMessage('Image is too large')
            return
        }

        setFile(file)
        setFileURL(URL.createObjectURL(file))
    }

    return (
        <>
        <form style={{textAlign: "center"}} onSubmit={(e) => {
            e.preventDefault()
            checkSubmission()}}>
            <div className={styles.imageUpload}>
                <div className={styles.imageWrap}>
                <label htmlFor="file-input">
                    {fileURL ? 
                    <img src={`${fileURL}`} width="200px" height="200px" className={styles.profileHover}></img>
                    :
                    <Image src={profilePicture} width="200px" height="200px" className={styles.profileHover}></Image>
                    }
                    <div className={styles.imageDescriptionLayer}>
                        <p className={styles.imgeDescription}>Change Profile Picture</p>
                    </div>
                </label>
                </div>
                
                <input id="file-input" type="file" onChange={onFileChange}></input>
            </div>
            <h3 style={{textAlign: "center"}}>Hello, {props.user.username}</h3>
            <div>Change Username</div>
            <input type="text" onChange={(e) => setForm({...form, ['username']: e.target.value})}></input>
            <div>Change Password</div>
            <input type="password" onChange={(e) => setForm({...form, ['newPassword']: e.target.value})}></input>
            <div><b>Confirm Password (Required to Confirm Edit)</b></div>
            <input type="password" onChange={(e) => setForm({...form, ['passwordConfirm']: e.target.value})}></input>
            <br></br>
            {file &&
            <>
            <br></br>
            <div><b>Your New Picture: </b>{file.name} <button onClick={(e) => {
                e.preventDefault()
                setFileURL(null)
                setFile(null)
            }}>x</button></div>
            </>}
            <br></br>
            <input type="submit"></input>
        </form>
        </>
    )
}