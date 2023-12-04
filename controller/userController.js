require('dotenv').config();
const User = require('../model/UserModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const UserTable = require('../entity/UserTable')
const getYourProfileUser = asyncHandler (async(req,res)=>{
    if(req.isAuthenticated())
    {
        res.status(200).json({message:"success", data: req.user.user})
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
    try{
        const {username, email, password, displayName} = req.body;
        const existingUser = await User.findOne({username: username})
        if(existingUser!==null)
        {
            res.status(409).json({isSuccess: false, message: "Account already existed"})
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
            res.status(200).json({ message: "Success"})
        }
    }
    catch(e)
    {
        res.status(500).json({message: "Server error"})
    }
})
const createAdminAccount = asyncHandler(async (req,res)=>{
    if(req.isAuthenticated() && req.user.user.role === UserTable.ROLE_ADMIN)
    {
        try{
        const {username, email, avatar, gender, password, displayName, role} = req.body;
        const existingUser = await User.findOne({username: username})
        if(existingUser!==null)
        {
            res.status(409).json({message: "Account already existed"})
        }
        else
        {
            const hashedPassword = await bcrypt.hash(password,10)
            const user = await User.create({
                displayName: displayName,
                username: username,
                password: hashedPassword,
                email: email,
                avatar: avatar,
                accountType: UserTable.TYPE_LOCAL_ACCOUNT,
                gender: gender,
                role: role || UserTable.ROLE_ADMIN
            })
            res.status(200).json({ message: "Success"})
        }}
        catch(e)
        {
            res.status(500).json({message: "Server error"})
        }
    }
})
const getListUser = asyncHandler(async(req,res)=>{
    console.log(req.user.user.role)
    if(req.isAuthenticated() && req.user.user.role===UserTable.ROLE_ADMIN)
    {
        const quantity = req.query.quantity || 50;
        const index = (req.query.index || 0)*quantity;
        const desc = req.query.des || -1;
        try{
            const user = await User.find({})          
            .sort({createdAt: desc }) // Sắp xếp theo trường lượt nghe (giảm dần)
            .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
            .limit(quantity); // Giới hạn kết quả trả về cho 'quantity'
            res.status(200).json({message: "Success",data: user});
        }
        catch(e)
        {
            res.status(500).json({message: "Server error"})
        }
    }
    else
    {
        res.sendStatus(401)
    }
})
const searchUserByNameAdmin = asyncHandler(async (req,res)=>{
    if(req.isAuthenticated() && req.user.user.role===UserTable.ROLE_ADMIN)
    {
        const nameSearch = req.query.name || ''
        const quantity = req.query.quantity || 10000;
        const index = (req.query.index || 0) * quantity;
        const desc = req.query.des || -1;
        console.log(nameSearch)
        try{
            const nameSearchRegex = new RegExp('^' + nameSearch,'i');
            const searchCondition = {
                $or: [
                    { displayName: { $regex: nameSearchRegex}},
                    { username: { $regex: nameSearchRegex}},
                    { email: nameSearch} 
                ]
            };
            const user = await User.find(searchCondition)          
            .sort({createdAt: desc }) // Sắp xếp theo trường lượt nghe (giảm dần)
            .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
            .limit(quantity); // Giới hạn kết quả trả về cho 'quantity'
            res.status(200).json({message: "Success",data: user});
        }
        catch(e)
        {
            res.status(500).json({message: "Server error"})
        }
    }
    else
    {
        res.sendStatus(401)
    }
})
module.exports = {getYourProfileUser,createAdminAccount,getUserByID,updateUserById,createNewAccount,searchUserByNameAdmin,getListUser}