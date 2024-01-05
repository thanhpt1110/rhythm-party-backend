const Music = require('../../model/MusicModel')
const asyncHandler = require('express-async-handler')
const MusicTable = require('../../entity/MusicTable')
const { deletefile } = require('../../ultis/Firebase')
const moment = require('moment');

// Pending Approval 
const getMusicUnauthentication = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            try {
                const result = await Music.find({
                    musicPrivacyType: MusicTable.MUSIC_PRIVACY_PUBLIC,
                    musicAuthorize: MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE,
                    isRequest: true
                })
                    .populate('musicPostOwnerID', 'displayName')
                    .select('musicName author genre createdAt') // Chọn các trường bạn muốn hiển thị

                const resultWithMessageCount = result.map(music => ({
                    id: music._id,
                    Pending: music.musicName,
                    Artist: music.author,
                    Genre: music.genre.join(', '), // Hiển thị genre dưới dạng chuỗi
                    'Upload date': moment(music.createdAt).format('DD/MM/YY - HH:mm:ss'),
                    'Upload by': music.musicPostOwnerID.displayName,
                }));

                return res.status(200).json({ message: "Update success", data: resultWithMessageCount })
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

const searchUnauthenticatedMusic = asyncHandler(async (req, res) => {
    if (req.isAuthenticated()) {
        const searchMusic = req.query.input_search;
        const quantity = req.query.quantity || 50;
        const index = req.query.index || 0;
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try {
            const searchMusicRegex = new RegExp(searchMusic, 'i'); // i là không phân biệt chữ hoa chữ thường
            const music = await Music.find({
                $or: [
                    { musicName: { $regex: searchMusicRegex } },
                    { author: { $regex: searchMusicRegex } },
                ]
                , musicPrivacyType: MusicTable.MUSIC_PRIVACY_PUBLIC,
                musicAuthorize: MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE,
                isRequest: true
            }
            )
                .populate('musicPostOwnerID', 'displayName')
                .sort({ musicName: 1, createAt: 1 })
                .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
                .limit(quantity)
                .select('musicName author genre createdAt') // Chọn các trường bạn muốn hiển thị

            const resultWithMessageCount = music.map(music => ({
                id: music._id,
                Pending: music.musicName,
                Artist: music.author,
                Genre: music.genre.join(', '), // Hiển thị genre dưới dạng chuỗi
                'Upload date': moment(music.createdAt).format('DD/MM/YY - HH:mm:ss'),
                'Upload by': music.musicPostOwnerID.displayName,
            }));

            res.status(200).json({ message: "Success", data: resultWithMessageCount });
        }
        catch (e) {
            console.log(e)
            res.status(500).json({ message: "Server error" })
        }
    }
    else {
        return res.sendStatus(401)
    }
})

// const approveSong
const approveSong = asyncHandler(async (req, res) => {
    if(req.isAuthenticated())
    {
        try{
            const id = req.params.id;
            const musicApprove = req.body;
            const music = await Music.findById(id);
            if(!music)
                return res.sendStatus(404);
            const newMusic = await Music.updateOne({_id: id}, {$set: {
                isRequest: false,
                musicAuthorize: musicApprove.musicAuthorize
                
            }},{new: true})
            return res.status(200).json({message: "Success", data: newMusic})
        }
        catch(e)
        {
            console.log(e);
            return res.sendStatus(500)
        }
    }
    else{
        return res.sendStatus(401);
    }
})
// const approveList
const approveList = asyncHandler(async (req, res) => {
    if(req.isAuthenticated())
    {
        try{
            const approveStatus = req.query.approve ? req.query.approve : "Unauthorize";
            const listMusicApprove = req.body;
            const idsToUpdate = listMusicApprove.map(music => music._id);
            const newListMusic = await Music.updateMany({ _id: { $in: idsToUpdate } },{$set: {musicAuthorize: approveStatus, isRequest: false}});
            res.status(200).json({message: 'Success', data: newListMusic})
        }
        catch(e)
        {
            console.log(e);
            res.sendStatus(500);
        }
    }
    else
        return res.sendStatus(401);
})
// const deleteList
const deleteList = asyncHandler(async (req, res) => {

})

// Song
const getAllMusic = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            try {
                const result = await Music.find()
                    .populate('musicPostOwnerID', 'displayName')
                    .select('musicName author genre musicPrivacyType createdAt')
                const resultWithMessageCount = result.map(music => ({
                    id: music._id,
                    Song: music.musicName,
                    Artist: music.author,
                    Genre: music.genre.join(', '), // Hiển thị genre dưới dạng chuỗi
                    Privacy: music.musicPrivacyType,
                    'Upload date': moment(music.createdAt).format('DD/MM/YY - HH:mm:ss'),
                    'Upload by': music.musicPostOwnerID.displayName,
                }));

                return res.status(200).json({ message: "Update success", data: resultWithMessageCount })
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

const searchAllMusic = asyncHandler(async (req, res) => {
    if (req.isAuthenticated()) {
        const searchMusic = req.query.input_search;
        const quantity = req.query.quantity || 50;
        const index = req.query.index || 0;
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try {
            const searchMusicRegex = new RegExp(searchMusic, 'i'); // i là không phân biệt chữ hoa chữ thường
            const music = await Music.find({
                $or: [
                    { musicName: { $regex: searchMusicRegex } },
                    { author: { $regex: searchMusicRegex } },
                ]
            }
            )
                .populate('musicPostOwnerID', 'displayName')
                .sort({ musicName: 1, createAt: 1 })
                .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
                .limit(quantity)
                .select('musicName author genre musicPrivacyType createdAt') // Chọn các trường bạn muốn hiển thị
            const resultWithMessageCount = music.map(music => ({
                id: music._id,
                Song: music.musicName,
                Artist: music.author,
                Genre: music.genre.join(', '), // Hiển thị genre dưới dạng chuỗi
                Privacy: music.musicPrivacyType,
                'Upload date': moment(music.createdAt).format('DD/MM/YY - HH:mm:ss'),
                'Upload by': music.musicPostOwnerID.displayName,
            }));

            res.status(200).json({ message: "Success", data: resultWithMessageCount });
        }
        catch (e) {
            console.log(e)
            res.status(500).json({ message: "Server error" })
        }
    }
    else {
        return res.sendStatus(401)
    }
})

const updateMusicInformationAdmin = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const _id = req.params.id;
            const existedMusic = await Music.findOne({ _id: _id });
            if (existedMusic) {
                if (existedMusic.musicPostOwnerID !== req.user.user._id) {
                    try {
                        const { musicName, genre, author, musicPrivacyType, lyrics, duration, description, url, imgUrl, releaseYear, musicAuthorize } = req.body;
                        const music = {
                            musicName: musicName ? musicName : existedMusic.musicName,
                            genre: genre ? genre : existedMusic.genre,
                            author: author ? author : existedMusic.author,
                            lyrics: lyrics ? lyrics : existedMusic.lyrics,
                            duration: duration ? duration : existedMusic.duration,
                            musicPrivacyType: musicPrivacyType ? musicPrivacyType : existedMusic.musicPrivacyType,
                            description: description ? description : existedMusic.description,
                            url: url ? url : existedMusic.url,
                            imgUrl: imgUrl ? imgUrl : existedMusic.imgUrl,
                            releaseYear: releaseYear ? releaseYear : existedMusic.releaseYear,
                            musicAuthorize: musicAuthorize ? musicAuthorize : existedMusic.musicAuthorize
                        }
                        const result = await Music.findOneAndUpdate({ _id: _id }, { $set: music }, { new: true });
                        const response = { message: "Success", data: result }
                        res.status(200).json(response);
                    }
                    catch (e) {
                        res.status(500).json({ message: "Server error" })
                    }
                }
                else
                    res.status(401).json({ message: "Unauthorize" });
            }
            else
                res.status(404).json({ message: "Not found" });
        }
    }
    catch (e) {
        res.status(500).json({ message: "Server error" })
    }
})

const deleteMusicByID = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const _id = req.params.id;
            const existedMusic = await Music.findOne({ _id: _id });
            console.log(existedMusic);
            if (existedMusic) {
                try {
                    await deletefile("music_avatar", "png", existedMusic._id);
                }
                catch (e) {
                    console.log(e);
                }
                finally {
                    try {
                        await deletefile("music", "mp3", existedMusic._id);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    finally {
                        try {
                            const result = await Music.deleteOne({ _id: _id });
                            const listMusic = await Music.find({})
                                .sort({ musicName: 1, createAt: 1 })
                                .limit(50)
                                .populate({
                                    path: 'musicPostOwnerID',
                                    model: 'User',
                                    select: ['avatar', 'displayName'] // Chọn các trường bạn muốn hiển thị, ví dụ 'avatar'
                                });
                            const response = { message: "Success", data: listMusic }
                            res.status(200).json(response);
                        }
                        catch (e) {
                            res.status(500).json({ message: "Server error" })
                        }
                    }
                }

            }
            else
                res.status(404).json({ message: "Not found" });
        }
    }
    catch (e) {
        res.status(500).json({ message: "Server error" })
    }
})

const getMusicByID = asyncHandler(async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const id = req.params.id;
            const music = await Music.findById(id)
                .populate({
                    path: 'musicPostOwnerID',
                    model: 'User',
                    select: ['avatar', 'displayName'] // Chọn các trường bạn muốn hiển thị, ví dụ 'avatar'
                });
            if (music)
                return res.status(200).json({ message: "Success", data: music });
            return res.sendStatus(404);
        }
        else
            return res.sendStatus(401)
    }
    catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
})

module.exports = {
    getMusicUnauthentication,
    searchUnauthenticatedMusic,
    getAllMusic,
    searchAllMusic,
    updateMusicInformationAdmin,
    deleteMusicByID,
    getMusicByID,
    approveSong,
    approveList,
    deleteList,
}