const express = require('express')
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const app = express()
const port = 8000

dotenv.config()

require("./database/connection");

const Users = require('./models/Users');
const Conversation = require('./models/Conversation');
const Message = require('./models/Messages');

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

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
                        next()
                    })

                    res.status(200).json({ user: { email: user.email, name: user.name }, token: user.token })
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
            return { user: { email: user.email, name: user.name }, conversationId: conversation._id }
        }))
        const data = await conversationData;
        res.status(200).json(data)
    } catch (error) {
        console.log("~ Conversation getting Error ☠️ ~", error)
    }
})

app.post('/api/message', async(req, res) =>{
    try {
        const {conversationId, senderId, message, receiverId = ''} = req.body;
        if (!senderId || !message)  return res.status(400).send("Please fill all fields");
        if (!conversationId && receiverId) {
            const newConversation = new Conversation({members: [senderId, receiverId]});
            await newConversation.save();
            const newMessage = new Message({conversationId: newConversation._id, senderId, message});
            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        } else if(!conversationId && !receiverId){
            return res.status(400).send("Please fill all fields"); 
        }
        const newMessage = new Message({conversationId, senderId, message});
        await newMessage.save();
        res.status(200).send("message send successfully");
    } catch (error) {
        console.log("~ Message Error ☠️ ~", error)
    }
})

app.get('/api/message/:conversationId', async(req, res) => {
    try {
        const conversationId = req.params.conversationId;
        if(conversationId === 'new' ) return res.status(200).json([]);
        const messages = await Message.find({conversationId});
        const messageUserData = Promise.all(messages.map(async (message) =>{
            const user = await Users.findById(message.senderId);
            return {user : {email: user.email, name: user.name }, message: message.message}
        }))
        const data = await messageUserData
        res.status(200).json(data)
    } catch (error) {
        console.log("~ Message getting Error ☠️ ~", error)
    }
})

app.get('/api/users', async(req, res) => {
    try {
        const users = await Users.find();
        const userData = Promise.all(users.map(async (user) => {
            return {user: {email: user.email, name: user.name}, userId: user._id}
        }))
        const allUsers = await userData;
        res.status(200).json(allUsers);
    } catch (error) {
        console.log("~ Users getting Error ☠️ ~", error)
    }
})

app.listen(port, () => console.log(`app is listening on port ${port}!`))