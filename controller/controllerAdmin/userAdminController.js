const UserTable = require("../../entity/UserTable");
const User = require("../../model/UserModel");
const asyncHandler = require("express-async-handler");
const moment = require("moment");
const bcrypt = require('bcrypt')

const getAllUser = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            try {
                const result = await User.find().select(
                    "displayName email role gender createdAt"
                );

                const mapResult = result.map((user) => ({
                    id: user._id,
                    Name: user.displayName,
                    Email: user.email,
                    Role: user.role, // Hiển thị genre dưới dạng chuỗi
                    Gender: user.gender,
                    "Create date": moment(user.createdAt).format(
                        "DD/MM/YY - HH:mm:ss"
                    ),
                }));

                return res
                    .status(200)
                    .json({ message: "Update success", data: mapResult });
            } catch (e) {
                return res.status(500).json({ message: "Server error" });
            }
        } else res.status(401).json({ message: "Unauthorize" });
    } catch (e) {
        return res.status(500).json({ message: "Server error" });
    }
});

const searchUser = asyncHandler(async (req, res) => {
    if (req.isAuthenticated()) {
        const searchUser = req.query.input_search;
        const quantity = req.query.quantity || 50;
        const index = req.query.index || 0;
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try {
            const searchUserRegex = new RegExp(searchUser, "i"); // i là không phân biệt chữ hoa chữ thường
            const user = await User.find({
                $or: [
                    { displayName: { $regex: searchUserRegex } },
                    { email: { $regex: searchUserRegex } },
                ],
            })
                .sort({ displayName: 1 })
                .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
                .limit(quantity)
                .select("displayName email role gender createdAt");

            const mapResult = user.map((user) => ({
                id: user._id,
                Name: user.displayName,
                Email: user.email,
                Role: user.role, // Hiển thị genre dưới dạng chuỗi
                Gender: user.gender,
                "Create date": moment(user.createdAt).format(
                    "DD/MM/YY - HH:mm:ss"
                ),
            }));

            res.status(200).json({ message: "Success", data: mapResult });
        } catch (e) {
            res.status(500).json({ message: "Server error" });
        }
    } else {
        return res.sendStatus(401);
    }
});

const createUserAccount = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated) {
            try {
                const user = req.body;
                const hashedPassword = await bcrypt.hash('1', 10);

                // Kiểm tra xem username hoặc email đã tồn tại chưa
                const existingUser = await User.findOne({ $or: [{ email: user.email }] });
                if (existingUser) {
                    // Nếu tồn tại, trả về mã lỗi 409 (Conflict)
                    return res.status(409).json({ message: "Email already exists" });
                }

                const newUser = new User({
                    displayName: user.displayName,
                    email: user.email,
                    username: user.email,
                    gender: user.gender,
                    isAvailable: true,
                    password: hashedPassword,
                    accountType: UserTable.TYPE_LOCAL_ACCOUNT,
                    role: UserTable.ROLE_USER,
                });

                await newUser.save();

                const mapResult = {
                    id: user._id,
                    Name: newUser.displayName,
                    Email: newUser.email,
                    Role: newUser.role,
                    Gender: newUser.gender,
                    "Create date": moment(user.createdAt).format(
                        "DD/MM/YY - HH:mm:ss"
                    ),
                };

                return res
                    .status(200)
                    .json({ message: "success", data: mapResult });
            } catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

const updateUserAccount = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            try {
                const id = req.params.id;
                const user = await User.findById(id);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                const userData = req.body;

                console.log(userData);

                user.displayName = userData.displayName;
                user.email = userData.email;
                user.username = userData.email;
                user.gender = userData.gender;
                user.isAvailable = userData.isAvailable;

                await user.save();

                const mapResult = {
                    id: user.id,
                    Name: user.displayName,
                    Email: user.email,
                    Role: user.role, // Hiển thị genre dưới dạng chuỗi
                    Gender: user.gender,
                    "Create date": moment(user.createdAt).format(
                        "DD/MM/YY - HH:mm:ss"
                    ),
                };

                return res
                    .status(200)
                    .json({ message: "success", data: mapResult });
            } catch (err) {
                console.log(err);
                res.status(500).json({ message: "Server error" });
            }
        } else {
            res.status(401).json({ message: "Unauthorize" });
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

const getUserByID = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const user = await User.findById(req.params.id).select(
                "-refreshToken"
            );
            if (user !== null && user !== undefined)
                res.status(200).json({ message: "Success", data: user });
            else
                res.status(404).json({
                    message: "User not existed",
                    data: null,
                });
        } else res.sendStatus(401);
    } catch (ex) {
        res.status(500).json({ message: "Server error", error: ex });
    }
});

const deleteUserById = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const userId = req.params.id;
            const user = await User.findByIdAndDelete(userId);
            if (user) {
                res.status(200).json({ message: "User deleted successfully" });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } else {
            res.sendStatus(401);
        }
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e });
    }
});

const deleteUserListByIdList = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const userList = req.body;
            const idsToDelete = userList.map(user => user.id);
            await User.deleteMany({ _id: { $in: idsToDelete } });
            res.status(200).json({ message: "Users deleted successfully" });
        } else {
            res.sendStatus(401);
        }
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e });
    }
});


module.exports = {
    getAllUser,
    searchUser,
    getUserByID,
    createUserAccount,
    updateUserAccount,
    deleteUserById,
    deleteUserListByIdList,
};
