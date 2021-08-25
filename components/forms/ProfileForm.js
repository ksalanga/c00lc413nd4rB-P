import Image from 'next/image'
import defaultPic from '../../public/default.png'
import styles from '../../styles/profilepicture.module.css'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'

export default function profileForm({ user }) {
    const router = useRouter()
    const userInfo = {id: user.id, user: user.username}
    const [newUsername, setNewUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState(false) 
    const [file, setFile] = useState(null)
    const [textOrPass, setTextOrPass] = useState('password')

    const checkSubmission = async () => {
        // On a multipart-form/data submission, do not include the Content-Type for multer since formData as a body forces that.
        var formSubmission = new FormData()

        // Multer might not have fully parsed the req.body if the file is being used first. 
        // Therefore, try to put the body first in formData so
        // all of those values are handled with before the main file is dealt with.
        for (var key in userInfo) {
            formSubmission.append(key, userInfo[key])
        }
        formSubmission.append('newUsername', newUsername)
        formSubmission.append('newPassword', newPassword)
        formSubmission.append('passwordConfirm', passwordConfirm)

        if (file != null) formSubmission.append('image', file)
        
        const response = await fetch('/api/users/edit', {
            method: 'POST',
            body: formSubmission
        })

        if (response.ok) {
            // update React Context here
            router.push('/')
            return
        }
        const message = await response.text()
        NotificationManager.warning(message, '', 10000)
    }

    const deleteUser = async () => {
        const response = await fetch('/api/users/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user: userInfo['user'], password: passwordConfirm})
        })

        if (response.ok) {
            await fetch('/api/users/logout', {method: 'GET'})
            router.push('/')
        }

        const message = await response.text()
        NotificationManager.warning(message, '', 10000)
    }

    const profilePicture = user.profilePicture ? user.profilePicture : defaultPic

    const onFileChange = event => {
        const file = event.target.files[0]

        if (!file) return

        if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
            NotificationManager.warning('File Must be image/png', '', 10000)
            return
        }
        
        setFile(file)
    }

    return (
        <>
        <NotificationContainer/>
        <form style={{textAlign: "center"}} onSubmit={(e) => {
            e.preventDefault()
            checkSubmission()}}>
            <div className={styles.imageUpload}>
                <div className={styles.imageWrap}>
                <label htmlFor="file-input">
                    {file ? 
                    <img src={`${URL.createObjectURL(file)}`} width="200px" height="200px" className={styles.profileHover}></img>
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
            <h3 style={{textAlign: "center"}}>Hello, {user.username}</h3>
            <div>Change Username</div>
            <input type="text" onChange={(e) => setNewUsername(e.target.value)}></input>
            <div>Change Password</div>
            <input type={textOrPass} onChange={(e) => setNewPassword(e.target.value)}></input>
            <div><b>Confirm Password (Required to Confirm Edit or Delete)</b></div>
            <input type={textOrPass} onChange={(e) => setPasswordConfirm(e.target.value)}></input>
            <br></br>
            <br></br>
            {file &&
            <>
            <div><b>Your New Picture: </b>{file.name} <button onClick={(e) => {
                e.preventDefault()
                setFile(null)
            }}>x</button></div>
            <br></br>
            </>}
            <button type="submit">Submit</button>
            <button onClick={(e) => { e.preventDefault()
            setTextOrPass(textOrPass === 'password' ? 'text' : 'password')}}>👁️</button>
            <br></br>
            <br></br>
            {!deleteConfirm &&
            <button onClick={(e) => {
                e.preventDefault()
                setDeleteConfirm(true)}}>Delete User</button>
            }
            {deleteConfirm &&
            <div>Are you sure you want to delete this account? 
                <button onClick={(e) => {
                    e.preventDefault()
                    deleteUser()
                }}>Yes
                </button>
                <button onClick={(e) => {
                    e.preventDefault()
                    setDeleteConfirm(false)
                }}>No
                </button>
            </div>
            }
        </form>
        </>
    )
}