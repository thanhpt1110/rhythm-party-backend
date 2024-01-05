const Playlist = require("../../model/PlaylistModel");
const asyncHandler = require("express-async-handler");
const { deletefile } = require("../../ultis/Firebase");

const getAllPlaylist = asyncHandler(async (req, res) => {
	try {
		if (req.isAuthenticated()) {
			try {
				const result = await Playlist.find()
					.populate("ownerPlaylistID", "displayName")
					.select("playlistName listMusic privacyStatus view");

				const mapResult = result.map((playlist) => ({
					id: playlist._id,
					User: playlist.ownerPlaylistID.displayName,
					Playlist: playlist.playlistName,
					"No. Songs": Array.isArray(playlist.listMusic)
						? playlist.listMusic.length
						: 0,
					Privacy: playlist.privacyStatus,
					View: playlist.view,
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

const searchPlaylist = asyncHandler(async (req, res) => {
	if (req.isAuthenticated()) {
		const searchPlaylist = req.query.input_search;
		const quantity = req.query.quantity || 50;
		const index = req.query.index || 0;
		// Sử dụng biểu thức chính quy để tạo điều kiện tìm kiếm
		try {
			const searchPlaylistRegex = new RegExp(searchPlaylist, "i"); // i là không phân biệt chữ hoa chữ thường
			const result = await Playlist.find({
				$or: [
					{ playlistName: { $regex: searchPlaylistRegex } },
				],
			})
				.populate("ownerPlaylistID", "displayName")
				.sort({ playlistName: 1 })
				.skip(index) // Bỏ qua các bản ghi từ đầu tiên đến index
				.limit(quantity)
				.select("playlistName listMusic privacyStatus view");

			const mapResult = result.map((playlist) => ({
				id: playlist._id,
				User: playlist.ownerPlaylistID.displayName,
				Playlist: playlist.playlistName,
				"No. Songs": Array.isArray(playlist.listMusic)
					? playlist.listMusic.length
					: 0,
				Privacy: playlist.privacyStatus,
				View: playlist.view,
			}));

			res.status(200).json({ message: "Success", data: mapResult });
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Server error" });
		}
	} else {
		return res.sendStatus(401);
	}
});

const getPlaylistByID = asyncHandler(async (req, res) => {
	try {
		if (req.isAuthenticated()) {
			const id = req.params.id;
			const playlist = await Playlist.findById(id).populate({
				path: "ownerPlaylistID",
				model: "User",
				select: ["displayName"],
			}).populate({
				path: "listMusic",
				model: "Music",
				select:["musicName", "duration", "url", "imgUrl"]
			});
			if (playlist)
				return res
					.status(200)
					.json({ message: "Success", data: playlist });
			return res.sendStatus(404);
		} else return res.sendStatus(401);
	} catch (e) {
		console.log(e);
		return res.sendStatus(500);
	}
});

const updatePlaylistByID = asyncHandler(async (req, res) => {
	if (req.isAuthenticated()) {
		try {
			const prevPlaylist = await Playlist.findById(req.params.id);
			const { playlistName, privacyStatus, description, avatarPlaylist } =
				req.body;
			const updateData = {
				playlistName: playlistName
					? playlistName
					: prevPlaylist.playlistName,
				privacyStatus: privacyStatus
					? privacyStatus
					: prevPlaylist.privacyStatus,
				description: description
					? description
					: prevPlaylist.description,
				avatarPlaylist: avatarPlaylist
					? avatarPlaylist
					: prevPlaylist.avatarPlaylist,
			};
			const playlist = await Playlist.findOneAndUpdate(
				{ _id: req.params.id },
				updateData,
				{ new: true }
			);
			return res
				.status(200)
				.json({
					message: "Success",
					data: playlist,
					accessToken: req.user.accessToken,
				});
		} catch (e) {
			res.status(500).json({ message: "Server error" });
		}
	} else {
		res.status(401).json({ message: "Unauthorized" });
	}
});

const removeSongFromPlaylist = asyncHandler(async (req, res) => {
	try {
		if (req.isAuthenticated()) {
			const { musicId } = req.body;
			const id = req.params.id;
			const prevPlaylist = await Playlist.findById(id);
			if (!prevPlaylist) return res.sendStatus(404);
			if (!prevPlaylist.listMusic.includes(musicId)) {
				res.status(200).json({
					message: "Success",
					data: prevPlaylist,
					accessToken: req.user.accessToken,
				});
				return;
			} else {
				const updatedPlaylist = await Playlist.findByIdAndUpdate(
					id,
					{ $pull: { listMusic: musicId } },
					{ new: true }
				);
				return res
					.status(200)
					.json({
						message: "Success",
						data: updatedPlaylist,
						accessToken: req.user.accessToken,
					});
			}
		} else {
			return res.status(401).json({ message: "Unauthorize" });
		}
	} catch (e) {
		return res.status(500).json({ message: "Server error" });
	}
});

const deletePlaylistById = asyncHandler(async (req, res) => {
	try {
		if (req.isAuthenticated()) {
			const _id = req.params.id;
			const existedPlaylist = await Playlist.findOne({ _id: _id });
			console.log(existedPlaylist);
			if (existedPlaylist) {
				try {
					try {
						if (existedPlaylist.avatarPlaylist)
							await deletefile(
								"playlist_avatar",
								"png",
								existedPlaylist._id
							);
					} catch (e) {
						console.log(e);
					} finally {
						try {
							const result = await Playlist.deleteOne({
								_id: _id,
							});
							const respone = {
								message: "Success",
								data: result,
							};
							res.status(200).json(respone);
						} catch (e) {
							res.status(500).json({ message: "Server error" });
						}
					}
				} catch (e) {
					res.status(500).json({ message: "Server error" });
				}
			}
		} else res.status(404).json({ message: "Not found" });
	} catch (e) {
		res.status(500).json({ message: "Server error" });
	}
});
module.exports = {
	getAllPlaylist,
	searchPlaylist,
	getPlaylistByID,
	updatePlaylistByID,
	deletePlaylistById,
	removeSongFromPlaylist,
};
