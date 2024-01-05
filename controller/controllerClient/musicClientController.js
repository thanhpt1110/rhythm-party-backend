const Music = require('../../model/MusicModel')
const MusicGenre = require('../../model/GenreModel')
const asyncHandler = require('express-async-handler')
const MusicTable = require('../../entity/MusicTable')
const UserTable = require('../../entity/UserTable')
const MusicMessage = require('../../model/MessageModel')
const MessageMusic = require('../../model/MessageModel')
const { deletefile } = require('../../ultis/Firebase')
const getMusicByID = asyncHandler(async (req,res)=>{
    try{
        const music = await Music.findById(req.params.id).populate({
            path: 'messages',
            options: { sort: { date: -1 } },
            populate: {
                path: 'userId',
                model: 'User',
                select: ['avatar','displayName'] // Chọn các trường bạn muốn hiển thị, ví dụ 'avatar'
            }
        });
        if(music)
        {
            res.status(200).json({message: "Success", data: music})
        }
        else
            res.sendStatus(404)
    }
    catch(e)
    {
        return res.sendStatus(500)
    }
})
const findMusicByNamePublic = asyncHandler(async (req,res)=>{
    // Lấy giá trị từ query parameter 'search'
    const searchMusic = req.query.music_name;
    const quantity = req.query.quantity || 50;
    const index = req.query.index || 0;
    const desc = req.query.desc || -1;
    // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
    try{
        const searchMusicRegex = new RegExp( searchMusic,'i'); 
        const music = await Music.find({ 
            $or: [
                { musicName: { $regex: searchMusicRegex } }, // i là không phân biệt chữ hoa chữ thường
                { author: { $regex: searchMusicRegex } },
              ],  
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
        console.log(e)
        res.status(500).json({message: "Server error"})
    }
})
const getTopMusic = asyncHandler(async (req,res)=>{
    // Lấy giá trị từ query parameter 'search'
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try{
            const quantity = 20
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
            const {musicName, genre, author, lyrics, duration, description, url,imgUrl, releaseYear, musicPrivacyType} = req.body
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
                musicPostOwnerID: req.user.user._id,
                isRequest: musicPrivacyType === MusicTable.MUSIC_PRIVACY_PUBLIC ? true : false 
            })
            res.status(200).json({message: "Success", data: music, accessToken: req.user.accessToken})
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
            const existedMusic = await Music.findOne({_id:_id});
            if(existedMusic)
            {
                if(existedMusic.musicPostOwnerID !== req.user.user._id)
                {
                    try 
                    {     
                        const {musicName, genre, author,musicPrivacyType, lyrics, duration, description, url,imgUrl, releaseYear} = req.body ;
                        
                        const musicUpdate = {           
                        musicName: musicName? musicName: existedMusic.musicName,
                        genre: genre ? genre :existedMusic.genre,
                        author: author ? author: existedMusic.author,
                        lyrics: lyrics ? lyrics: existedMusic.lyrics,
                        duration: duration ? duration: existedMusic.duration,
                        musicPrivacyType: musicPrivacyType ? musicPrivacyType : existedMusic.musicPrivacyType,
                        description: description ? description: existedMusic.description,
                        url: url ? url : existedMusic.url,
                        imgUrl: imgUrl ? imgUrl : existedMusic.imgUrl,
                        isRequest: musicPrivacyType ? musicPrivacyType === MusicTable.MUSIC_PRIVACY_PUBLIC && existedMusic.musicAuthorize === MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE ? true : false : existedMusic.isRequest,
                        releaseYear: releaseYear ? releaseYear: existedMusic.releaseYear
                        } 
                        console.log("music");
                        console.log(musicUpdate)
                        const result = await Music.findOneAndUpdate({ _id: _id }, { $set: musicUpdate }, {new:true});
                        const respone = {message: "Success", data: result} 
                        res.status(200).json(respone);
                    }
                    catch(e){
                        console.log(e);
                        res.status(500).json({message: "Server error"})
                    }
                }
                else
                    res.status(401).json({message: "Unauthorize"});
            }
            else
                res.status(404).json({message: "Not found"});
        }
    }
    catch(e)
    {
        res.status(500).json({message: "Server error"})
    }
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
        return res.status(500).json({message: "Server error"});
    }
})

const getMusicCurrentUser = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            try{
                const result = await Music.find({musicPostOwnerID: req.user.user._id})
                res.status(200).json({message: "Success", data: result, accessToken: req.user.accessToken})   
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
        return res.status(500).json({message: "Server error"})            
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
        return res.status(500).json({message: "Server error"})            
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
            })
            const Message = await MessageMusic.findById(newMessage._id)
            .populate({
                path: 'userId',
                model: 'User',
                select: ['avatar', 'displayName'],
            })
            .exec();
            const music = await Music.findById(req.params.id);
            if (!music) {
                res.status(404).json({message: "Music not existed", data: null})
                return;
            }
            music.messages.push(newMessage._id);
            music.save();
            return res.status(200).json({message: "Success", data: Message});
        }
        else
            return  res.status(401).json({message: "Unauthorize"})
    }
    catch(e)
    {
        return res.status(500).json({message: "Server error"})            

    }
})
const deleteMusicById = asyncHandler(async(req,res) =>{
    try{
        if(req.isAuthenticated())
        {
            const _id = req.params.id;
            const existedMusic = await Music.findOne({_id:_id});
            console.log(existedMusic);
            if(existedMusic)
            {
                if(existedMusic.musicPostOwnerID !== req.user.user._id)
                {
                    try{
                        await deletefile("music_avatar","png", existedMusic._id);
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                    finally{
                        try{
                            await deletefile("music","mp3", existedMusic._id);
                        }
                        catch(e)
                        {
                            console.log(e);
                        }
                        finally{
                            try 
                            {                
                                const result =  await Music.deleteOne({_id:_id});
                                const respone = {message: "Success", data: result} 
                                res.status(200).json(respone);
                            }
                            catch(e){
                                res.status(500).json({message: "Server error"})
                            }  
                        }
                    }
                }
                else
                    res.status(401).json({message: "Unauthorize"});
            }
            else
                res.status(404).json({message: "Not found"});
        }
    }
    catch(e)
    {
        res.status(500).json({message: "Server error"})
    }
})
module.exports = {listenMusic,
    updateMusicInformation,getMusicByID,
    getTopMusic,findMusicByNamePublic,uploadMusic,
    updateMusicPrivacyStatus,getMusicCurrentUser,musicMessageUpload,deleteMusicById}
