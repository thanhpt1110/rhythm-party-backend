const Music = require('../../model/MusicModel')
const asyncHandler = require('express-async-handler')
const MusicTable = require('../../entity/MusicTable')
const UserTable = require('../../entity/UserTable')
const updateMusicInformationAdmin = asyncHandler(async(req,res)=>{
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
                        const {musicName, genre, author,musicPrivacyType, lyrics, duration, description, url,imgUrl, releaseYear, musicAuthorize} = req.body ;
                        const music = {           
                        musicName: musicName? musicName: existedMusic.musicName,
                        genre: genre ? genre :existedMusic.genre,
                        author: author ? author: existedMusic.author,
                        lyrics: lyrics ? lyrics: existedMusic.lyrics,
                        duration: duration ? duration: existedMusic.duration,
                        musicPrivacyType: musicPrivacyType ? musicPrivacyType: existedMusic.musicPrivacyType,
                        description: description ? description: existedMusic.description,
                        url: url ? url : existedMusic.url,
                        imgUrl: imgUrl ? imgUrl : existedMusic.imgUrl,
                        releaseYear: releaseYear ? releaseYear: existedMusic.releaseYear,
                        musicAuthorize: musicAuthorize ? musicAuthorize: existedMusic.musicAuthorize} 
                        const result = await Music.findOneAndUpdate({ _id: _id }, { $set: music }, {new:true});
                        const respone = {message: "Success", data: result} 
                        res.status(200).json(respone);
                    }
                    catch(e){
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
const getMusicUnauthentication = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            if(req.user.role!== UserTable.ROLE_ADMIN)
            res.status(401).json({message: "Unauthorize"})
            else{
                try{
                    const result = await Music.find({
                        musicPrivacyType: MusicTable.MUSIC_PRIVACY_PUBLIC,
                        musicAuthorize: MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE})
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
    catch(e){
        return res.status(500).json({message: "Server error"})            

    }
})
const getAllMusic = asyncHandler(async(req,res) =>{
    try{
        const quantity = req.query.quantity || 100
        const index = (req.query.index || 0) * quantity
        const music = await Music.find({})
        .sort({musicName: 1, createAt: 1 })
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
const searchAllMusic = asyncHandler(async(req,res) =>{
    if(req.isAuthenticated())
    {
        const searchMusic = req.query.input_search;
        const quantity = req.query.quantity || 50;
        const index = req.query.index || 0;
        const desc = req.query.desc || 1;
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try{
            const searchMusicRegex = new RegExp( searchMusic,'i'); 
            const music = await Music.find({ 
                $or: [
                    { musicName: { $regex: searchMusicRegex } }, // i là không phân biệt chữ hoa chữ thường
                    { author: { $regex: searchMusicRegex } },
                  ]}
            )          
            .sort({ musicName: desc, createAt: 1 }) // Sắp xếp theo trường lượt nghe (giảm dần)
            .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
            .limit(quantity); // Giới hạn kết quả trả về cho 'quantity'
            res.status(200).json({message: "Success",data: music});
        }
        catch(e)
        {
            console.log(e)
            res.status(500).json({message: "Server error"})
        }
    }
    else{
        return res.sendStatus(401)
    }
})
const searchUnauthenticatedMusic = asyncHandler(async(req,res) =>{
    if(req.isAuthenticated())
    {
        const searchMusic = req.query.input_search;
        const quantity = req.query.quantity || 50;
        const index = req.query.index || 0;
        const desc = req.query.desc || 1;
        // Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
        try{
            const searchMusicRegex = new RegExp( searchMusic,'i'); 
            const music = await Music.find({ 
                $or: [
                    { musicName: { $regex: searchMusicRegex } }, // i là không phân biệt chữ hoa chữ thường
                    { author: { $regex: searchMusicRegex } },
                  ] 
                  ,musicPrivacyType: MusicTable.MUSIC_PRIVACY_PUBLIC,
                  musicAuthorize: MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE}
            )          
            .sort({ musicName: 1, createAt: 1 }) // Sắp xếp theo trường lượt nghe (giảm dần)
            .skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
            .limit(quantity); // Giới hạn kết quả trả về cho 'quantity'
            res.status(200).json({message: "Success",data: music});
        }
        catch(e)
        {
            console.log(e)
            res.status(500).json({message: "Server error"})
        }
    }
    else{
        return res.sendStatus(401)
    }
})
module.exports = {getMusicUnauthentication, updateMusicInformationAdmin, getAllMusic, searchUnauthenticatedMusic, searchAllMusic}