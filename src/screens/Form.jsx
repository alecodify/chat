import React, { useState } from 'react'
import { Button, Input } from '../components'
import { useNavigate } from 'react-router-dom'


const Form = ({ isSignIn = false, }) => {
  const [data, setData] = useState({
    ...(!isSignIn && {
      name: "",
    }),
    email: "",
    password: "",
  })

  const navigate = useNavigate();

  console.log(data)
  return (
    <div className='bg-white w-[350px] rounded-lg lg:w-[600px] h-[550px] lg:h-[600px] flex flex-col justify-center items-center shadow-lg'>
      <div className='text-3xl font-extrabold'>WELCOME {isSignIn && "BACK"}</div>
      <div className='text-xl font-light mb-4'>{isSignIn ? "Sign in to get explored" : "Sign up now to get started"}</div>
      <form className='flex flex-col w-[100%] items-center justify-center' onSubmit={() => {console.log("Submitted")}}>
        {!isSignIn && <Input label={"Name"} name={"name"} placeholder={"Enter your name"} className={"mb-4 w-[60%] lg:w-1/2 "} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />}
        <Input label={"Email"} type='email' name={"email"} placeholder={"Enter your email"} className={"mb-4 w-[60%] lg:w-1/2 "} value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        <Input label={"Password"} type='password' name={"password"} placeholder={"Enter your password"} className={"mb-6 w-[60%] lg:w-1/2 "} value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
        <Button label={isSignIn ? "Sign In" : "Sign Up"} type='submit' className={"max-w-[40%] lg:w-1/4 mb-4"} />
      </form>
      <div className='text-gray-400 text-sm'>{isSignIn ? "Didn't have an account? " : "Already have an account? "} <span className='text-primary cursor-pointer underline' onClick={() => navigate((`/users/${isSignIn ? "sign_up" : "sign_in"}`))}> {isSignIn ? "sign up" : "sign in"}</span></div>
    </div>
  )
}

export default Form