const asyncHandler = require('express-async-handler')
const Playlist = require('../model/PlaylistModel')
const PlaylistTable = require('../entity/PlaylistTable')
const createPlaylist = asyncHandler(async(req,res)=>{
    if(req.isAuthenticated())
    {
        try{
            const {playListName, description} = req.body
            if(!playListName)
            {
                res.status(400).json({message: "input field need to be required"})
                return;
            }
            const playlist = await Playlist.create({
                playListName: playListName,
                description: description,
                ownerPlaylistID: req.user._id
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
})
const getPlaylistByID = asyncHandler(async(req,res)=>{
    try{
        const playlistPublic = await Playlist.findOne({_id: req.params.id, privacyStatus: PlaylistTable.PLAYLIST_PRIVACY_PUBLIC});
        if(playlistPublic==null)
        {
            if(res.isAuthenticated())
            {
                try{
                    const playlistPrivate = await Playlist.findOne({_id: req.params.id, ownerPlaylistID: req.user.user._id})
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
            res.status(200).json({message: "Success", data: playlistPublic, accessToken: req.user.accessToken})
        }
    }
    catch(e)
    {
        res.sendStatus(500)
    }
})
const getPlaylistFromCurrentUser = asyncHandler(async(req,res)=>{
    if(req.isAuthenticated())
    {
        try{
            const playlist = await Playlist.find({ownerPlaylistID: req.user.user._id})
            res.status(200).json({message: "Success", data: playlist, accessToken: req.user.accessToken})
        }
        catch(e)
        {
            res.sendStatus(401)
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
            const {playListName, privacyStatus, description} = req.body
            const updateData = {playListName: playListName, privacyStatus: privacyStatus, description: description}
            const playlist = await Playlist.updateData({_id: req.params.id},updateData)
            res.status(200).json({message: "Success", data: playlist, accessToken: req.user.accessToken})
        }
        catch(e)
        {
            res.sendStatus(401)
        }
    }
    else{
        res.sendStatus(401)
    }
})
const searchPublicMusicPlaylistByName =asyncHandler(async (req,res) =>{
    const playlistName = req.query.playlist_name
    try{
        const playlistNameRegex = new RegExp('^' + playlistName,'i');
        const playlist = await Playlist.find({ 
            playlistName: { $regex: playlistNameRegex },  
            privacyStatus: PlaylistTable.PLAYLIST_PRIVACY_PUBLIC}
        );
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
        const playlist = await Playlist.find({privacyStatus: PlaylistTable.PLAYLIST_PRIVACY_PUBLIC})
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
module.exports = {createPlaylist,getPlaylistByID,getPlaylistFromCurrentUser,updatePlaylistMusicInfomation,searchPublicMusicPlaylistByName,getMostFamousPlaylist}