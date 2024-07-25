import React, { useEffect, useState } from 'react'
import { Input } from '../components';
import { VscCallOutgoing } from "react-icons/vsc";
import { MdSend, MdOutlineAdd } from "react-icons/md";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config.json";
import "../styles/dashboard.scss";

const Dashboard = () => {
    const [messageCount, setMessageCount] = useState({});
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversations, setConversations] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [users, setusers] = useState([]);
    const [socket, setSocket] = useState(null);
    const messagesContainerRef = React.createRef();

    console.log("conversations : >> ", conversations)

    useEffect(() => {
        const newSocket = io(`${SOCKET_URL}`, { transports: ['websocket'] });

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });
    
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    
        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    
        setSocket(newSocket);
      
    }, [])

    useEffect(() => {
        socket?.emit('addUser', user.id);
        socket?.on('getUsers', users => {
            console.log('active users :>> ', users);
        })
        socket?.on('getMessage', data => {
            console.log("data :>> ", data);
            setMessages(prev => ({
                ...prev, messages: [...prev.messages, {user: data.user, message: data.message}]
            }));
        })
    }, [socket])

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo(0, messagesContainerRef.current.scrollHeight);
          }
	}, [messages])

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))

        const fetchData = async () => {
            const response = await fetch(`/api/conversation/${loggedInUser.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            setConversations(data)
        }

        fetchData();
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch(`/api/users/${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            setusers(data);
        }

        fetchUsers();
    },[])

    const fetchMessages = async (conversationId, receiver) => {
        const response = await fetch(`/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        setMessages({ messages: data, receiver, conversationId })
    }

    const sendMessage = async () => {
        setMessage("");
        socket?.emit('sendMessage', {
            conversationId: messages?.conversationId,
            senderId: user?.id,
            message: message,
            receiverId: messages?.receiver?.receiverId
        })
        const res = await fetch(`/api/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: messages?.conversationId,
                senderId: user?.id,
                message: message,
                receiverId: messages?.receiver?.receiverId
            })
        })
        const response = await res.json();
    }

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '';
    };

    return (
        <div className='dashboard-container w-screen h-screen flex'>
            <div className='dashboard-left w-[25%]  h-screen '>
                <div className='dashboard-left-wrapper flex justify-center items-center my-8'>
                    <div><img src="/user.png" alt="" className='dashboard-left-img rounded-[100%] border-2 border-blue-300 h-[35px] w-[35px] lg:h-[75px] lg:w-[75px]' /></div>
                    <div className='ml-2 lg:ml-4'>
                        <h3 className='dashboard-left-name text-lg font-medium lg:text-2xl'>{user.name}</h3>
                        <p className='dashboard-left-status text-sm lg:text-lg font-normal'>My Account</p>
                    </div>
                </div>
                <hr />
                <div className='dashboard-left-message-container ml-2 lg:ml-4'>
                    <div className='text-primary text-lg lg:text-xl'>Messages</div>
                    <div className='ml-0'>
                        {conversations.length > 0 ? conversations.map(({ conversationId, user }) => (
                            <div key={conversationId} onClick={() => { fetchMessages(conversationId, user) }} className='flex items-center py-2 lg:py-4 border-b-2 lg:border-b-gray-400'>
                                <div className='relative'>
                                    <div className='dashboard-left-friend-img bg-secondary text-center flex items-center justify-center text-lg p-2 text-black rounded-[100%] border-2 border-gray-400 h-[35px] w-[35px] lg:h-[60px] lg:w-[60px]'>{getInitial(user.name)}</div>
                                    <div className={`online-dot lg:hidden ${messageCount === 0 ? "hidden" : ""}`}>{}</div>
                                </div>
                                <div className='ml-2 lg:ml-6'>
                                    <h3 className='dashboard-left-friend-name text-md font-medium lg:text-lg'>{user.name}</h3>
                                    <p className='dashboard-left-friend-status text-sm lg:text-md font-light'>{user.email}</p>
                                </div>
                            </div>
                        )) : (
                            <div className='text-[10px] lg:text-[16px] mt-4 text-center'>No Conversations</div>
                        )}
                    </div>
                </div>
            </div>

            <div className='dashboard-center w-[50%] h-screen flex flex-col items-center bg-secondary'>
                {messages.receiver?.name &&
                    <div className='dashboard-center-header w-[75%] bg-blue-100 h-[80px] mt-14 rounded-full flex items-center px-10 mb-4'>
                        <div className='text-center flex items-center justify-center bg-secondary text-lg p-2 text-black rounded-[100%] border-2 border-gray-400 h-[35px] w-[35px] lg:h-[60px] lg:w-[60px]'>{getInitial(messages.receiver.name)}</div>
                        <div className='dashboard-center-wrapper ml-6 mr-auto'>
                            <h3 className='text-md font-medium lg:text-lg'>{messages.receiver.name}</h3>
                            <p className='text-sm lg:text-md font-light'>online</p>
                        </div>
                        <div className='cursor-pointer'>
                            <VscCallOutgoing size={20} color='black' />
                        </div>
                    </div>
                }

                <div className='h-[75%] border w-full overflow-y-scroll no-scrollbar'>
                    <div className='h-[1000px] px-6 lg:px-10 py-14 '>
                        {messages.messages?.length > 0 ? messages.messages?.map(({ message, user: { id } = {} }) => (
                           <div>
                               <div ref={messagesContainerRef} className={`w-[70%] lg:max-w-[45%] text-sm lg:text-md p-4 rounded-b-xl mb-6 ${id === user.id ? "bg-blue-400 rounded-tl-xl ml-auto text-white" : "rounded-tr-xl bg-gray-300"}`}>{message}</div>
                           </div>
                        )) : (
                            <div className='text-center text-sm lg:text-lg lg:font-semibold mt-40'>No Conversation Selected</div>
                        )}

                    </div>
                </div>
                {messages.receiver?.name &&
                    <div className='py-10 px-4 w-full flex items-center relative'>
                        <Input type='text' placeholder={"type message here ..."} value={message} onChange={(e) => { setMessage(e.target.value) }} className={"w-[100%] lg:w-[100%] mr-16"} inputClassName={"p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 focus:outline-none outline-none"} />
                        <div className='absolute right-6 '><MdOutlineAdd size={20} color='black' /></div>
                        <div className='absolute right-14 '><MdSend size={20} color='black' onClick={() => { sendMessage(), setMessage("") }} className={`${!message && 'pointer-events-none'}`} /></div>
                    </div>
                }
            </div>

            <div className='dashboard-friend-list w-[25%] h-screen'>
                <div className='dashboard-find-friend-heading text-primary mt-10 ml-6 text-lg lg:text-xl'>People</div>
                <div className='dashboard-right h-[90%] overflow-y-scroll no-scrollbar'>
                    {users.length > 0 ? users.map(({ userId, user }) => (
                        <div key={userId} onClick={() => { fetchMessages("new", user) }} className='dashboard-find-new-friend flex items-center mx-4  py-2 lg:py-4 border-b-2 lg:border-b-gray-400'>
                            <div className='relative'>
                                <div className='dashboard-find-new-friend-img rounded-[100%] border-2 flex items-center justify-center text-center bg-red-400 text-white font-bold border-blue-300 p-4 h-[35px] w-[35px] lg:h-[60px] lg:w-[60px]'>{getInitial(user.name)}</div>
                            </div>
                            <div className='ml-2 lg:ml-6'>
                                <h3 className='dashboard-find-new-friend-name text-md font-medium lg:text-lg'>{user.name}</h3>
                                <p className='dashboard-find-new-friend-status text-sm lg:text-md font-light'>{user.email}</p>
                            </div>
                        </div>
                    )) : (
                        <div className='text-[10px] lg:text-[16px] mt-4 text-center'>No user available</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard