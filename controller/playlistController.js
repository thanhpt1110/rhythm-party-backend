const asyncHandler = require('express-async-handler')
const Playlist = require('../model/PlaylistModel')
const PlaylistTable = require('../entity/PlaylistTable')
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
                res.status(200).json({message: "Create playlist success", data: playlist, accessToken: req.user.accessToken})
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
                        res.sendStatus(404)
                        return;
                    }
                }
                catch(e)
                {
                    res.sendStatus(500)
                }
            }
            else
            {
                res.sendStatus(404)
                return;
            }
        }
        else
        {
            await Playlist.updateOne({_id: req.params.id}, { $inc: { view: 1 } })
            res.status(200).json({message: "Success", data: playlistPublic})
        }
    }
    catch(e)
    {
        console.log(e)
        res.sendStatus(500)
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
            res.sendStatus(500)
        }
    }
    else{
        res.sendStatus(401)
    }
})
const updatePlaylistMusicInfomation = asyncHandler(async(req,res) =>{
    // Check authentication and jwt token
    if(req.isAuthenticated())
    {
        try{
            const prevPlaylist = await Playlist.findById(req.params.id);
            const {playlistName, privacyStatus, description} = req.body
            
            const updateData = {playlistName: playlistName? playlistName: prevPlaylist.playlistName,
                 privacyStatus: privacyStatus ? privacyStatus: prevPlaylist.privacyStatus, 
                 description: description ? description: prevPlaylist.description}
            const playlist = await Playlist.updateData({_id: req.params.id},updateData)
            res.status(200).json({message: "Success", data: playlist, accessToken: req.user.accessToken})
        }
        catch(e)
        {
            res.sendStatus(500)
        }
    }
    else{
        res.sendStatus(401)
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
            return res.sendStatus(401)
        }
    }
    catch(e)
    {
    console.log(e);
      return res.sendStatus(500)
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
            return res.sendStatus(401)
        }
    }
    catch(e)
    {
      return res.sendStatus(500)
    }
})
const searchPublicMusicPlaylistByName =asyncHandler(async (req,res) =>{
    const playlistName = req.query.playlist_name
    try{
        const playlistNameRegex = new RegExp('^' + playlistName,'i');
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
module.exports = {createPlaylist,
    getPlaylistByID,getPlaylistFromCurrentUser,
    updatePlaylistMusicInfomation,searchPublicMusicPlaylistByName,
    getMostFamousPlaylist,addNewSongToPlaylist, removeSongFromPlaylist}