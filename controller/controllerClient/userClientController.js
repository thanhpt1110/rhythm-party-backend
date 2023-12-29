require('dotenv').config();
const User = require('../../model/UserModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const UserTable = require('../../entity/UserTable')
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
    try{
        if(req.isAuthenticated())
        {
            const id = req.params.id;
            if(id === req.user.user._id || req.user.user.role === "admin")
            {
                try {
                    const {displayName, gender, birthday, avatar} = req.body;
                    const user = await User.findById(id);
                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }  
                    user.displayName = displayName ? displayName : user.displayName;
                    user.gender = gender ? gender : user.gender;
                    user.birthday = birthday ? birthday: user.birthday;
                    user.avatar = avatar ? avatar : user.avatar;
                    await user.save();
                    const userData = {
                        displayName: user.displayName,
                        gender: user.gender,
                        birthday: user.birthday,
                        avatar: user.avatar,
                        role: user.role,
                        _id: user._id,
                        email: user.email
                    }
                    if(req.user.user._id === id)
                    {
                        req.user.user = userData
                    }
                    return res.status(200).json({message: "success", data: userData});
                } catch (err) {
                    res.status(500).json({ message: "Server error" });
                }
            }
            else
                res.status(401).json({message: "Unauthorize role"})
        }
        else
        {
            res.status(401).json({message: "Unauthorize"})
        }  
    }
    catch(e)
    {
        res.sendStatus(500)
    }
    
})
const createNewAccount = asyncHandler(async(req,res) =>{
    try{
        const { email, password, displayName} = req.body;
        const user = await User.findOne({username: email})
        if(user!==null)
        {
            res.status(409).json({isSuccess: false, message: "Account already existed"})
        }
        else
        {
            const hashedPassword = await bcrypt.hash(password,10)
            const user = await User.create({
                displayName: displayName,
                username: email,
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
        const user = await User.findOne({username: username})
        if(user!==null)
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
    else{
        res.sendStatus(401)
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