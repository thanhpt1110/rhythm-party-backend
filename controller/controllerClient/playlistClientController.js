const asyncHandler = require('express-async-handler')
const Playlist = require('../../model/PlaylistModel')
const PlaylistTable = require('../../entity/PlaylistTable')
const { deletefile } = require('../../ultis/Firebase')
const createPlaylist = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            try{
                const {playlistName, privacyStatus} = req.body
                if(!playlistName)
                {
                    res.status(400).json({message: "input field need to be required"})
                    return;
                }
                const playlist = await Playlist.create({
                    playlistName: playlistName,
                    privacyStatus: privacyStatus,
                    ownerPlaylistID: req.user.user._id
                })
                const newPlaylist = await Playlist.findById(playlist._id)        
                .populate({
                    path: 'ownerPlaylistID',
                    model: 'User',
                    select: [ 'displayName']
                })
                res.status(200).json({message: "Create playlist success", data: newPlaylist, accessToken: req.user.accessToken})
            }
            catch(Exception)
            {
                res.sendStatus(500)
            }
        }
        else
        {
            res.sendStatus(401)
        }
    }
    catch(e)
    {
        res.sendStatus(500)
    }
})
const getPlaylistByID = asyncHandler(async(req,res)=>{
    try{
        const playlistPublic = await Playlist.findOne({_id: req.params.id, privacyStatus: PlaylistTable.PLAYLIST_PRIVACY_PUBLIC})                 
        .populate({
            path: 'ownerPlaylistID',
            model: 'User',
            select: [ 'displayName']
        })
        .populate({
            path: "listMusic",
            model: "Music"
        });
        if(!playlistPublic)
        {
            if(req.isAuthenticated())
            {
                try{
                    const playlistPrivate = await Playlist.findOne({_id: req.params.id, ownerPlaylistID: req.user.user._id})         
                    .populate({
                        path: 'ownerPlaylistID',
                        model: 'User',
                        select: [ 'displayName']
                    })        
                    .populate({
                        path: "listMusic",
                        model: "Music"
                    });
                    if(playlistPrivate!=null)
                    {
                        await Playlist.updateOne({_id: req.params.id}, { $inc: { view: 1 } })            
                        res.status(200).json({message: "Success", data: playlistPrivate,accessToken: req.user.accessToken})
                        return;
                    }
                    else{
                        res.status(404).json({message: "playlist not found"})
                        return;
                    }
                }
                catch(e)
                {
                    return res.status(500).json({message: "Server error"})
                }
            }
            else
            {
                res.status(404).json({message: "playlist not found"})
                return;
            }
        }
        else
        {
            await Playlist.updateOne({_id: req.params.id}, { $inc: { view: 1 } })
            return res.status(200).json({message: "Success", data: playlistPublic})
        }
    }
    catch(e)
    {
        console.log(e)
        return res.status(500).json({message: "Server error"})
    }
})
const getPlaylistFromCurrentUser = asyncHandler(async(req,res)=>{
    if(req.isAuthenticated())
    {
        try{
            const playlist = await Playlist.find({ownerPlaylistID: req.user.user._id}).populate({
                path: 'ownerPlaylistID',
                model: 'User',
                select: [ 'displayName']
            })
            res.status(200).json({message: "Success", data: playlist, accessToken: req.user.accessToken})
        }
        catch(e)
        {
            res.status(500).json({message: "Server error"})
        }
    }
    else{
        res.status(401).json({message: "Unauthorized"});
    }
})
const updatePlaylistMusicInfomation = asyncHandler(async(req,res) =>{
    // Check authentication and jwt token
    if(req.isAuthenticated())
    {
        try{
            const prevPlaylist = await Playlist.findById(req.params.id);
            const {playlistName, privacyStatus, description, avatarPlaylist} = req.body
            const updateData = {playlistName: playlistName? playlistName: prevPlaylist.playlistName,
                 privacyStatus: privacyStatus ? privacyStatus: prevPlaylist.privacyStatus, 
                 description: description ? description: prevPlaylist.description,
                 avatarPlaylist: avatarPlaylist ? avatarPlaylist: prevPlaylist.avatarPlaylist}
            const playlist = await Playlist.findOneAndUpdate({_id: req.params.id},updateData, {new: true})
            return res.status(200).json({message: "Success", data: playlist, accessToken: req.user.accessToken})
        }
        catch(e)
        {
            res.status(500).json({message: "Server error"})
        }
    }
    else{
        res.status(401).json({message: "Unauthorized"});
    }
})
const addNewSongToPlaylist = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const {musicId} = req.body;
            const id = req.params.id;
            const prevPlaylist = await Playlist.findById(id);
            if(!prevPlaylist)
                return res.sendStatus(404);
            if(!prevPlaylist.listMusic.includes(musicId))
            {
                prevPlaylist.listMusic.push(musicId);
                await prevPlaylist.save();
            }
            return res.status(200).json({message: "Success", data: prevPlaylist, accessToken: req.user.accessToken})

        }
        else{
            res.status(401).json({message: "Unauthorized"});
        }
    }
    catch(e)
    {
    console.log(e);
      return res.status(500).json({message: "Server error"});
    }
})
const removeSongFromPlaylist = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const {musicId} = req.body;
            const id = req.params.id;
            const prevPlaylist = await Playlist.findById(id);
            if(!prevPlaylist)
                return res.sendStatus(404);
            if(!prevPlaylist.listMusic.includes(musicId))
            {
                res.status(200).json({message:"Success", data: prevPlaylist, accessToken: req.user.accessToken})
                return;
            }
            else
            {
                const updatedPlaylist = await Playlist.findByIdAndUpdate(
                    id,
                    { $pull: { listMusic: musicId } },
                    { new: true }
                );
                return res.status(200).json({message: "Success", data: updatedPlaylist, accessToken: req.user.accessToken})
            }
        }
        else{
            return res.status(401).json({message: "Unauthorize"})
        }
    }
    catch(e)
    {
        return res.status(500).json({message: "Server error"});
    }
})
const searchPublicMusicPlaylistByName =asyncHandler(async (req,res) =>{
    const playlistName = req.query.playlist_name
    try{
        const playlistNameRegex = new RegExp(playlistName,'i');
        const playlist = await Playlist.find({ 
            playlistName: { $regex: playlistNameRegex },  
            privacyStatus: PlaylistTable.PLAYLIST_PRIVACY_PUBLIC}
        ).populate({
            path: 'ownerPlaylistID',
            model: 'User',
            select: [ 'displayName']
        });
        res.status(200).json({message: "Success",data: playlist});
    }
    catch(e)
    {
        res.sendStatus(500)
    }
})
const getMostFamousPlaylist =asyncHandler(async(req,res) =>{
    try{
        const quantity = req.query.quantity || 20;
        const index = (req.query.index || 0)*quantity;
        const playlist = await Playlist.find({privacyStatus: PlaylistTable.PLAYLIST_PRIVACY_PUBLIC}).populate({
            path: 'ownerPlaylistID',
            model: 'User',
            select: [ 'displayName']
        })
        .sort({view: -1})
        .limit(quantity)
        .skip(index);
        res.status(200).json({message: "Success", data: playlist})
    }
    catch(e)
    {
        res.sendStatus(500)
    }
})
const deletePlaylistById = asyncHandler(async(req,res) =>{
    try{
        if(req.isAuthenticated())
        {
            const _id = req.params.id;
            const existedPlaylist = await Playlist.findOne({_id:_id});
            console.log(existedPlaylist);
            if(existedPlaylist)
            {
                if(existedPlaylist.ownerPlaylistID !== req.user.user._id)
                {
                    try{
                        if(existedPlaylist.avatarPlaylist)
                            await deletefile("playlist_avatar","png", existedPlaylist._id)
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                    finally{
                        try 
                        {                
                            const result =  await Playlist.deleteOne({_id:_id});
                            const respone = {message: "Success", data: result} 
                            res.status(200).json(respone);
                        }
                        catch(e){
                            res.status(500).json({message: "Server error"})
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
module.exports = {createPlaylist,
    getPlaylistByID,getPlaylistFromCurrentUser,
    updatePlaylistMusicInfomation,searchPublicMusicPlaylistByName,
    getMostFamousPlaylist,addNewSongToPlaylist, removeSongFromPlaylist,deletePlaylistById}