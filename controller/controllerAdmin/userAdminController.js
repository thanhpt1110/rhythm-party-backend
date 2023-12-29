const UserTable = require('../../entity/UserTable')
const User = require('../../model/UserModel')
const asyncHandler = require('express-async-handler')
const getAllUser = asyncHandler(async(req,res) =>{
    try{
        if(req.isAuthenticated())
        {
            const userFieldSelected = [_id,displayName, gender, email, isAvailable]
            const quantity = req.query.quantity || 50
            const index = (req.query.index || 0) * quantity
            const user = await User.find({role: UserTable.ROLE_USER})
            .select(userFieldSelected)
            .sort({createdAt: -1})
            .limit(quantity)
            .skip(index);
            return res.status(200).json({message: "Success", data: user});
        }
        else{
            return res.sendStatus(401);
        }
    }
    catch(e)
    {
        console.log(e)
        res.sendStatus(500);
    }
})
const searchUser = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const userFieldSelected = [displayName, gender, email, isAvailable]
            const userInputSearch = req.query.user_input || '';
            const quantity = req.query.quantity || 50
            const searhUsercRegex = new RegExp(userInputSearch,'i'); 
            const index = (req.query.index || 0) * quantity
            const user = await User.find({$or: [
                { displayName: { $regex: searhUsercRegex } }, // i là không phân biệt chữ hoa chữ thường
                { email: { $regex: searhUsercRegex } },
              ],role: UserTable.ROLE_USER})
            .select(userFieldSelected)
            .sort({createdAt: -1})
            .limit(quantity)
            .skip(index);
            return res.status(200).json({message: "Success", data: user})
        }
        else
            return res.sendStatus(401);
    }
    catch(e)
    {
        console.log(e)
        return res.sendStatus(500)
    }
})
const updateUserAccount = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {

                try {
                    const id = req.params.id;
                    const {displayName, gender, password, isAvailable} = req.body;
                    const hashedPassword = password ? await bcrypt.hash(password,10) : null
                    const user = await User.findById(id);
                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }  
                    user.displayName = displayName ? displayName : user.displayName;
                    user.gender = gender ? gender : user.gender;
                    user.birthday = birthday ? birthday: user.birthday;
                    user.password = hashedPassword ? hashedPassword: user.password;
                    user.isAvailable = isAvailable ? isAvailable : user.isAvailable;
                    await user.save();
                    const userData = {
                        displayName: user.displayName,
                        gender: user.gender,
                        birthday: user.birthday,
                        avatar: user.avatar,
                        role: user.role,
                        _id: user._id,
                        email: user.email,
                        isAvailable: user.isAvailable
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
        {
            res.status(401).json({message: "Unauthorize"})
        }  
    }
    catch(e)
    {
        res.sendStatus(500)
    }
    
})
const getUserByID = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const user = await User.findById(req.params.id);
            if(user !==null && user !==undefined)
                res.status(200).json({message:"Success", data: user})
            else
                res.status(404).json({message: "User not existed", data: null})
        }
        else
            res.sendStatus(401)
    }
    catch(ex)
    {
        res.status(500).json({message:"Server error",error: ex})
    }

})
module.exports = {getAllUser, searchUser, getUserByID, updateUserAccount}