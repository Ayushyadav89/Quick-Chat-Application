import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfilePage() {
  const [selectedImg, setSelectedImg] = useState(null)
  const navigate = useNavigate();
  const [name, setName] = useState("Ayush Yadav")
  const [bio, setBio] = useState("Hi Everyone, I am using QuickChat")
 
  return (
    <div className='min-h-screen bg-color bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form className='flex flex-col gap-5 p-10 flex-1' action="">
          <h3 className='text-lg'>Prfile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png .jpg .jpeg' hidden />
            <img src="" alt="" />
          </label>
        </form>
        <img src="" alt="" />
      </div>
    </div>
  )
}

export default ProfilePage
