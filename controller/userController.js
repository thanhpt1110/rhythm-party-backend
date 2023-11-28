require('dotenv').config();
const User = require('../model/UserModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const UserTable = require('../entity/UserTable')
const getUser = asyncHandler (async(req,res)=>{
    if(req.isAuthenticated())
    {
        User.find()
        res.status(200).json({message:"success", data: req.user})
    }
    else
    {
        res.status(401).json({message: "Unauthorize"});
    } 
})
const getUserByID = asyncHandler(async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(user !==null && user !==undefined)
            res.status(200).json({message:"Success", data: user})
        else
            res.status(404).json({message: "User not existed", data: null})
    }
    catch(ex)
    {
        res.status(500).json({message:"Server error",error: ex})
    }

})
const updateUserById = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    console.log(id);
    //console.log(req)
    if(req.isAuthenticated())
    {
        if(id === req.user._id || req.user.role === "admin")
        {
            try {
                const {displayName, gender, birthday, avatar} = req.body;
                const user = await User.findById(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }  
                if (displayName != null) {
                    user.displayName = displayName;
                }
                if (gender != null) {
                    user.gender = gender;
                }
                if (birthday != null) {
                    user.birthday = birthday;
                }
                if (avatar != null) {
                    user.avatar = avatar;
                }
                await user.save();
                res.status(200).json({message: "success", user: user});
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        }
        else
            res.status(401).json({message: "Unauthorize role"})
    }
    else
    {
        res.status(401).json({message: "Unauthorize"})
    }
})
const createNewAccount = asyncHandler(async(req,res) =>{
    console.log(req.body)
    const {username, email, password, displayName} = req.body;
    const existingUser = await User.findOne({username: username})
    if(existingUser!==null)
    {
        res.status(200).json({isSuccess: false, message: "Account already existed"})
    }
    else
    {
        const hashedPassword = await bcrypt.hash(password,10)
        const user = await User.create({
            displayName: displayName,
            username: username,
            password: hashedPassword,
            email: email,
            avatar: null,
            accountType: UserTable.TYPE_LOCAL_ACCOUNT,
            gender: null,
            role: UserTable.ROLE_USER
        })
        console.log("first Create")
        res.json({isSuccess: true, message: "Success", user: user})
    }
})
module.exports = {getUser,getUserByID,updateUserById,createNewAccount}