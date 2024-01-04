const UserTable = require('../../entity/UserTable')
const User = require('../../model/UserModel')
const asyncHandler = require('express-async-handler')
const moment = require('moment')

const getAllUser = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            try {
                const result = await User.find()
                    .select('displayName email role gender createdAt')

                const mapResult = result.map(user => ({
                    id: user._id,
                    Name: user.displayName,
                    Email: user.email,
                    Role: user.role, // Hiển thị genre dưới dạng chuỗi
                    Gender: user.gender,
                    'Create date': moment(user.createdAt).format('DD/MM/YY - HH:mm:ss'),
                }));

                return res.status(200).json({ message: "Update success", data: mapResult })
            }
            catch (e) {
                return res.status(500).json({ message: "Server error" })
            }
        }
        else
            res.status(401).json({ message: "Unauthorize" })
    }
    catch (e) {
        return res.status(500).json({ message: "Server error" })
    }
})

const searchUser = asyncHandler(async (req, res) => {
    if (req.isAuthenticated()) {
        const searchUser = req.query.input_search;
        const quantity = req.query.quantity || 50;
        const index = req.query.index || 0;
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try {
            const searchUserRegex = new RegExp(searchUser, 'i'); // i là không phân biệt chữ hoa chữ thường
            const user = await User.find({
                $or: [
                    { displayName: { $regex: searchUserRegex } },
                    { email: { $regex: searchUserRegex } },
                ]
            }
            )
                .sort({ displayName: 1 })
                .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
                .limit(quantity)
                .select('displayName email role gender createdAt')

                const mapResult = user.map(user => ({
                    id: user._id,
                    Name: user.displayName,
                    Email: user.email,
                    Role: user.role, // Hiển thị genre dưới dạng chuỗi
                    Gender: user.gender,
                    'Create date': moment(user.createdAt).format('DD/MM/YY - HH:mm:ss'),
                }));

            res.status(200).json({ message: "Success", data: mapResult });
        }
        catch (e) {
            res.status(500).json({ message: "Server error" })
        }
    }
    else {
        return res.sendStatus(401)
    }
})

const updateUserAccount = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {

            try {
                const id = req.params.id;
                const { displayName, gender, birthday, password, isAvailable } = req.body;
                const hashedPassword = password ? await bcrypt.hash(password, 10) : null
                const user = await User.findById(id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                user.displayName = displayName ? displayName : user.displayName;
                user.gender = gender ? gender : user.gender;
                user.birthday = birthday ? birthday : user.birthday;
                user.password = hashedPassword ? hashedPassword : user.password;
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
                if (req.user.user._id === id) {
                    req.user.user = userData
                }
                return res.status(200).json({ message: "success", data: userData });
            } catch (err) {
                console.log(err)
                res.status(500).json({ message: "Server error" });
            }
        }
        else {
            res.status(401).json({ message: "Unauthorize" })
        }
    }
    catch (e) {
        console.log(e);
        res.sendStatus(500)
    }
})

const getUserByID = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const user = await User.findById(req.params.id).select('-refreshToken');
            if (user !== null && user !== undefined)
                res.status(200).json({ message: "Success", data: user })
            else
                res.status(404).json({ message: "User not existed", data: null })
        }
        else
            res.sendStatus(401)
    }
    catch (ex) {
        res.status(500).json({ message: "Server error", error: ex })
    }

})
module.exports = { getAllUser, searchUser, getUserByID, updateUserAccount }