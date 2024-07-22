import React, { useState } from 'react'
import { Input } from '../components';
import { VscCallOutgoing } from "react-icons/vsc";
import { MdSend , MdOutlineAdd } from "react-icons/md";
import "../styles/dashboard.scss";

const Dashboard = () => {
    const [messageCount, setMessageCount ] = useState(1);
    const contacts = [
        {
            name: "Zain",
            status: "Available",
            img: "/user.png"
        },
        {
            name: "Aroosa",
            status: "Available",
            img: "/user1.png"
        },
    ]
    return (
        <div className='dashboard-container w-screen h-screen flex'>
            <div className='dashboard-left w-[25%]  h-screen '>
                <div className='dashboard-left-wrapper flex justify-center items-center my-8'>
                    <div><img src="/user.png" alt="" className='dashboard-left-img rounded-[100%] border-2 border-blue-300 h-[35px] w-[35px] lg:h-[75px] lg:w-[75px]' /></div>
                    <div className='ml-2 lg:ml-4'>
                        <h3 className='dashboard-left-name text-lg font-medium lg:text-2xl'>Ali Raza</h3>
                        <p className='dashboard-left-status text-sm lg:text-lg font-normal'>online</p>
                    </div>
                </div>
                <hr />
                <div className='dashboard-left-message-container ml-2 lg:ml-4'>
                    <div className='text-primary text-lg lg:text-xl'>Messages</div>
                    <div className='ml-0'>
                        {contacts.map(({ name, status, img }) => (
                            <div className='flex items-center py-2 lg:py-4 border-b-2 lg:border-b-gray-400'>
                                <div className='relative'><img src={img} alt="" className='dashboard-left-friend-img rounded-[100%] border-2 border-blue-300 h-[35px] w-[35px] lg:h-[60px] lg:w-[60px]' /><div className={`online-dot ${messageCount === 0 ? "hidden" : ""}`}>1</div></div>
                                <div className='ml-2 lg:ml-6'>
                                    <h3 className='dashboard-left-friend-name text-md font-medium lg:text-lg'>{name}</h3>
                                    <p className='dashboard-left-friend-status text-sm lg:text-md font-light'>{status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='dashboard-center w-[50%] h-screen flex flex-col items-center bg-secondary'>
                <div className='dashboard-center-header w-[75%] bg-blue-100 h-[80px] mt-14 rounded-full flex items-center px-10 mb-4'>
                    <div><img src="user1.png" alt="" className='cursor-pointer rounded-[100%] border-2 border-blue-300 h-[35px] w-[35px] lg:h-[60px] lg:w-[60px]' /></div>
                    <div className='dashboard-center-wrapper ml-6 mr-auto'>
                        <h3 className='text-md font-medium lg:text-lg'>Aroosa</h3>
                        <p className='text-sm lg:text-md font-light'>online</p>
                    </div>
                    <div className='cursor-pointer'>
                        <VscCallOutgoing size={20} color='black' />
                    </div>
                </div>
                <div className='h-[75%] border w-full overflow-y-scroll no-scrollbar border-b-gray-300 border-b-2'>
                    <div className='h-[1000px] px-6 lg:px-10 py-14 '>
                        <div className='w-[90%] lg:max-w-[45%] text-sm lg:text-md bg-gray-200 rounded-b-xl rounded-tr-xl p-4 mb-6'>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores assumenda officiis sit molestiae repellat vitae amet veritatis deleniti corporis consequuntur?
                        </div>
                        <div className='w-[90%] lg:max-w-[45%]  text-sm lg:text-md bg-blue-400 rounded-b-xl rounded-tl-xl ml-auto p-4 text-white mb-6'>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, vero.
                        </div>
                    </div>
                </div>
                <div className='py-10 px-4 w-full flex items-center relative'>
                    <Input type='text' placeholder={"type message here ..."} className={"w-[100%] lg:w-[100%] mr-16"} inputClassName={"p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 focus:outline-none outline-none"} />
                    <div className='absolute right-6 '><MdOutlineAdd size={20} color='black' /></div>
                    <div className='absolute right-14 '><MdSend size={20} color='black' /></div>
                </div>
            </div>

            <div className='dashboard-right w-[25%] h-screen bg-secondary'></div>
        </div>
    )
}

export default Dashboard