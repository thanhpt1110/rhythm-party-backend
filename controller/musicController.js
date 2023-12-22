const Music = require('../model/MusicModel')
const MusicGenre = require('../model/GenreModel')
const asyncHandler = require('express-async-handler')
const MusicTable = require('../entity/MusicTable')
const UserTable = require('../entity/UserTable')
const MusicMessage = require('../model/MessageMusic')
const MessageMusic = require('../model/MessageMusic')
const getMusicByID = asyncHandler(async (req,res)=>{
    try{
        const music = await Music.findById(req.params.id).populate({
            path: 'messages',
            options: { sort: { date: -1 } },
            populate: {
                path: 'userId',
                model: 'User',
                select: 'avatar' // Chọn các trường bạn muốn hiển thị, ví dụ 'avatar'
            }
        });
    }
    catch(e)
    {
        return res.sendStatus(500)
    }
})
const updateViewMusic = asyncHandler(async(req,res)=>{
    try{
        await Music.updateOne({_id:req.params.id},{ $inc: { view: 1 } })
        res.status(200).json({message: "Success", data: music})
    }
    catch(e)
    {
        return res.sendStatus(500);
    }
    
})
const findMusicByNamePublic = asyncHandler(async (req,res)=>{
    // Lấy giá trị từ query parameter 'search'
    const musicname = req.query.music_name;
    const quantity = req.query.quantity || 50;
    const index = req.query.index || 0;
    const desc = req.query.desc || -1;
    // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
    try{
        const musicnameRegex = new RegExp('^' + musicname,'i');
        const music = await Music.find({ 
            musicName: { $regex: musicnameRegex },  
            musicPrivacyType: MusicTable.MUSIC_PRIVACY_PUBLIC,
            musicAuthorize: MusicTable.MUSIC_AUTHENTICATION_AUTHORIZE}
        )          
        .sort({ view: desc }) // Sắp xếp theo trường lượt nghe (giảm dần)
        .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
        .limit(quantity); // Giới hạn kết quả trả về cho 'quantity'
        res.status(200).json({message: "Success",data: music});
    }
    catch(e)
    {
        res.status(500).json({message: "Server error"})
    }
})
const getTopMusic = asyncHandler(async (req,res)=>{
    // Lấy giá trị từ query parameter 'search'
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try{
            const quantity = req.query.quantity || 20
            const index = (req.query.index || 0) * quantity
            const music = await Music.find({
            musicPrivacyType: MusicTable.MUSIC_PRIVACY_PUBLIC,
            musicAuthorize: MusicTable.MUSIC_AUTHENTICATION_AUTHORIZE
            })
            .sort({view: -1})
            .limit(quantity)
            .skip(index);
            res.status(200).json({message: "Success",data: music});
        }
        catch(e)
        {
            console.log(e)
            res.status(500).json({message: "Server error"})
        }
})
const uploadMusic = asyncHandler(async (req, res)=>{
    try{
        if(req.isAuthenticated())
        {
            try{
            console.log("Create music")
            const {musicName, genre, author, lyrics, duration, description, url,imgUrl, releaseYear, musicPrivacyType} = req.body
            console.log(req.body)
            if (!musicName && !genre && !author && !lyrics && !duration && !description && !releaseYear) {
                res.status(400).json({ message: 'Missing required fields' });
                return;
            }
            for (let i = 0; i < genre.length; i++) {
                try {
                  const existingGenre = await MusicGenre.findOne({ musicGenre: genre[i] });
        
                  if (existingGenre) {
                    await MusicGenre.updateOne({ _id: existingGenre._id }, { $inc: { musicQuantity: 1 } });
                  } else {
                    await MusicGenre.create({ musicGenre: genre[i] });
                  }
                } catch (error) {
                  return res.status(500).json({ message: "Internal Server Error" });
                }
              }
            const music = await Music.create({
                musicName: musicName,
                genre: genre,
                author: author,
                lyrics: lyrics,
                duration: duration,
                description: description,
                url: url ? url : null,
                imgUrl: imgUrl ? imgUrl : null,
                releaseYear: releaseYear,
                musicPrivacyType: musicPrivacyType,
                musicPostOwnerID: req.user.user._id
            })
            res.status(200).json({message: "Success", data: music, accessToken: req.user.accessToken})
            console.log("Create music success")
            }
            catch(ex)
            {
                res.status(500).json({message: "Server error", error: ex})
            }
        }
        else
            res.status(401).json({message: "Unauthorize"})
    }
    catch(e)
    {
        return res.sendStatus(500)
    }
})
const updateMusicInformation = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const _id = req.params.id;
            console.log(_id)
            const existedMusic = await Music.findOne({_id:_id});
            if(existedMusic)
            {
                if(existedMusic.musicPostOwnerID !== req.user.user._id)
                {
                    try 
                    {                
                        const {musicName, genre, author, lyrics, duration, description, url,imgUrl, releaseYear} = req.body ;
                        const music = {           
                        musicName: musicName? musicName: existedMusic.musicName,
                        genre: genre ? genre :existedMusic.genre,
                        author: author ? author: existedMusic.author,
                        lyrics: lyrics ? lyrics: existedMusic.lyrics,
                        duration: duration ? duration: existedMusic.duration,
                        description: description ? description: existedMusic.description,
                        url: url ? url : existedMusic.url,
                        imgUrl: imgUrl ? imgUrl : existedMusic.imgUrl,
                        releaseYear: releaseYear} 
                        const result = await Music.findOneAndUpdate({ _id: _id }, { $set: music }, {new:true});
                        const respone = {message: "Success", data: result} 
                        res.status(200).json(respone);
                    }
                    catch(e){
                        res.sendStatus(500)
                    }
                }
                else
                    res.sendStatus(401)
            }
            else
                res.sendStatus(404);
        }
    }
    catch(e)
    {res.sendStatus(500)}
})
const updateMusicPrivacyStatus = asyncHandler( async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            try{
                const { _id, musicPrivacyType,  musicPostOwnerID} = req.body;
                if(musicPostOwnerID != req.user._id)
                {
                    res.status(404).json({message: "Validation error"})
                    return;
                }
                const result = await Music.updateOne({ _id: _id }, { $set: { musicPrivacyType:musicPrivacyType} }); 
                res.status(200).json({message: "Update success", data: result, accessToken: req.user.accessToken})   
            }
            catch(ex)
            {
                res.status(500).json({message: "Server error", error: ex})            
            }
        }
        else{
            res.status(401).json({message: "Unauthorize"})
        }
    }
    catch(e)
    {
        return res.sendStatus(500);
    }
})
const updateMusicAuthorization = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            if(req.user.role!== UserTable.ROLE_ADMIN)
                res.status(401).json({message: "Unauthorize"})
            else{
                try{
                    const { _id, musicAuthorize} = req.body;
                    const result = await Music.updateOne({ _id: _id }, { $set: { musicAuthorize: musicAuthorize} }); 
                    return res.status(200).json({message: "Update success", data: result, accessToken: req.user.accessToken})   
                }
                catch(ex)
                {
                   return res.status(500).json({message: "Server error", error: ex})            
                }
            }
        }
        else
            res.status(401).json({message: "Unauthorize"})
    }
    catch(e)
    {
        res.sendStatus(500);
    }
})
const getMusicUnauthentication = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            if(req.user.role!== UserTable.ROLE_ADMIN)
            res.status(401).json({message: "Unauthorize"})
            else{
                try{
                    const result = await Music.find({musicAuthorize: MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE})
                    return res.status(200).json({message: "Update success", data: result, accessToken: req.user.accessToken})   
                }
                catch(ex)
                {
                   return res.status(500).json({message: "Server error", error: ex})            
                }
            }
        }
        else
           return res.sendStatus(401)
    }
    catch(e){
        return res.sendStatus(500)
    }
})
const getMusicCurrentUser = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            try{
                const result = await Music.find({musicPostOwnerID: req.user.user._id})
                console.log(result);
                res.status(200).json({message: "Success", data: result, accessToken: req.user.accessToken})   
            }
            catch(ex)
            {
                res.status(500).json({message: "Server error", error: ex})            
            }
        }
        else{
            res.sendStatus(401);
        }
    }
    catch(e)
    {
        res.sendStatus(500)
    }
})
const listenMusic = asyncHandler(async(req,res)=>{
    try{
        const music = await Music.findById(req.params.id);
        if(music)
        {
            await Music.updateOne({_id:req.params.id},{ $inc: { view: 1 } })
        }
        else
            res.status(404).json({message: "Music not existed", data: null})
    }
    catch(e)
    {
        res.sendStatus(500);
    }
})
const musicMessageUpload = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const {message} = req.body;

           const newMessage = await MessageMusic.create({
                userId:req.user.user._id,
                message:message
            });
            const music = await Music.findById(req.params.id);
            if (!music) {
                res.sendStatus(404)
                return;
            }
            music.messages.push(newMessage._id);
            music.save();
            return res.status(200).json({message: "Success", data: newMessage});
        }
        else
            return res.sendStatus(401)
    }
    catch(e)
    {
        return res.sendStatus(500);
    }
})
module.exports = {listenMusic,
    updateMusicInformation,getMusicByID,
    getTopMusic,findMusicByNamePublic,uploadMusic,
    updateMusicPrivacyStatus,updateMusicAuthorization,
    getMusicUnauthentication,getMusicCurrentUser,musicMessageUpload,updateViewMusic}
