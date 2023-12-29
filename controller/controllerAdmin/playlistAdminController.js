const Playlist = require('../../model/PlaylistModel')
const asyncHandler = require('express-async-handler')
const getAllPlaylist = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const quantity = req.query.quantity || 50
            const index = (req.query.index || 0) * quantity
            const playlist = await Playlist.find({})
            .sort({playlistName: 1, createdAt: 1})
            .limit(quantity)
            .skip(index);
            return res.status(200).json({message: "Success", data: playlist})
        }
        else
            return res.sendStatus(401);
    }
    catch(e)
    {
        console.log(e);
        res.sendStatus(500);
    }
})
const searchPlaylist = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const playlist_input_search = req.query.playlist_input;
            const quantity = req.query.quantity || 50
            const index = (req.query.index || 0) * quantity
            const searchPlaylistcRegex = new RegExp(playlist_input_search,'i');  
            const playlist = await Playlist.find({
                playlistName: { $regex: searchPlaylistcRegex }
            })
            .sort({playlistName: 1, createdAt: 1})
            .limit(quantity)
            .skip(index);
            return res.status(200).json({message: "Success", data: playlist})
        }
        else
            return res.sendStatus(401);
    }
    catch(e)
    {
        console.log(e);
        res.sendStatus(500);
    }
})
module.exports = {getAllPlaylist, searchPlaylist}