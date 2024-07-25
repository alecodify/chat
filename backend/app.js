const express = require('express')
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const cors = require("cors")
const io = require("socket.io")(8080, {
    cors:{
        origin: "http://localhost:5173"
    }
})

dotenv.config()

const app = express()
const port = 8000

require("./database/connection");

const Users = require('./models/Users');
const Conversation = require('./models/Conversation');
const Message = require('./models/Messages');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

let users = [];
io.on("connection", socket => {
    console.log("user connection" , socket.id);
    socket.on('addUser', userId =>{
        const isUserExist = users.find(user => user.userId === userId);
        console.log("userId in socket", userId)
        if (!isUserExist) {
            const user = {userId, socketId: socket.id};
            users.push(user);
            io.emit('getUsers', users);   
        }
    });

    socket.on('sendMessage', async({senderId, receiverId, message, conversationId}) =>{
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: {id: user._id, name: user.name, email: user.email}
            }) 
        }else {
            io.to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, name: user.name, email: user.email }
            });
        }
    })

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    })
})

app.get('/', (req, res) => res.send('Welcome!'))
app.post('/api/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).send("Please fill all required fields")
        } else {
            const isAlreadyExist = await Users.findOne({ email });
            if (isAlreadyExist) {
                res.status(400).send("User is Already Exist");
            } else {
                const newUser = new Users({ name, email, })
                bcryptjs.hash(password, 10, (err, hashedPassword) => {
                    newUser.set('password', hashedPassword);
                    newUser.save();
                    next()
                })
                return res.status(200).send('user register successfully');
            }
        }

    } catch (error) {
        console.log("~ Register Error ☠️ ~", error)
    }
})

app.post("/api/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).send("Please fill all required fields");
        } else {
            const user = await Users.findOne({ email });
            if (!user) {
                res.status(400).send("user email is incorrect");
            } else {
                const validateUser = await bcryptjs.compare(password, user.password);
                if (!validateUser) {
                    res.status(400).send('user password is incorrect');
                } else {
                    const payload = {
                        userId: user._id,
                        email: user.email
                    }
                    const JWT_SECRET_KEY = process.env.JWTSECRETKEY;
                    jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 86400 }, async (err, token) => {
                        await Users.updateOne({ _id: user._id }, {
                            $set: { token }
                        })
                        user.save()
                        return res.status(200).json({ user: { id: user._id, email: user.email, name: user.name }, token: token })
                    })

                }
            }
        }
    } catch (error) {
        console.log("~ Login Error ☠️ ~", error)
    }
})

app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversation({ members: [senderId, receiverId] });
        await newConversation.save();
        res.status(200).send('Conversation created successfully')
    } catch (error) {
        console.log("~ Conversation Error ☠️ ~", error)
    }
})

app.get('/api/conversation/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversation = await Conversation.find({ members: { $in: [userId] } })
        const conversationData = Promise.all(conversation.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId)
            const user = await Users.findById(receiverId);
            return { user: { receiverId: user._id, email: user.email, name: user.name }, conversationId: conversation._id }
        }))
        const data = await conversationData;
        res.status(200).json(data)
    } catch (error) {
        console.log("~ Conversation getting Error ☠️ ~", error)
    }
})

app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;
        if (!senderId || !message) return res.status(400).send("Please fill all fields");
        if (conversationId === "new" && receiverId) {
            const newConversation = new Conversation({ members: [senderId, receiverId] });
            await newConversation.save();
            const newMessage = new Message({ conversationId: newConversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        } else if (!conversationId && !receiverId) {
            return res.status(400).send("Please fill all fields");
        }
        const newMessage = new Message({ conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send("message send successfully");
    } catch (error) {
        console.log("~ Message Error ☠️ ~", error)
    }
})

app.get('/api/message/:conversationId', async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            const messages = await Message.find({ conversationId });
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await Users.findById(message.senderId);
                return { user: { id: user._id, email: user.email, name: user.name }, message: message.message }
            }))
            const data = await messageUserData
            res.status(200).json(data)
        }

        const conversationId = req.params.conversationId;
        if (conversationId === 'new') {
            const checkConversation = await Conversation.find({ members: { $all: [req.query.senderId, req.query.receiverId] } })
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id)
            } else {
                return res.status(200).json([])
            }
        } else {
            checkMessages(conversationId);
        }
    } catch (error) {
        console.log("~ Message getting Error ☠️ ~", error)
    }
})

app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const ongoingConversations = await Conversation.find({ members: { $all: [userId] } });
        const conversationUsers = ongoingConversations.flatMap(conversation => conversation.members);
        const uniqueConversationUsers = [...new Set(conversationUsers.filter(id => id !== userId))];
        const users = await Users.find({ _id: { $ne: userId, $nin: uniqueConversationUsers } });
        const userData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, name: user.name, receiverId: user._id } }
        }))
        const allUsers = await userData;
        res.status(200).json(allUsers);
    } catch (error) {
        console.log("~ Users getting Error ☠️ ~", error)
    }
})

app.listen(port, () => console.log(`app is listening on port ${port}!`))