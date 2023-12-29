require('dotenv').config();
const Genre = require('../../model/GenreModel')
const asyncHandler = require('express-async-handler')

const getMostFamousGerne = asyncHandler(async(req,res)=>{
    try {
      const musicname = req.query.music_name;
      const quantity = req.query.quantity || 1000;
      const index = req.query.index || 0;
      const desc = req.query.desc || -1;
        const genre = await Genre.find({}) // Tìm tất cả bản nhạc
        .sort({ musicQuantity: -1 }) // Sắp xếp theo trường lượt nghe (giảm dần)// Giới hạn kết quả trả về cho 50 bản nhạc đầu tiên
        res.status(200).json({message: "Success", data: genre}); // Trả về kết quả top 50 bản nhạc được nghe nhiều nhất
      } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' }); // Xử lý lỗi nếu có
      }
})
const findGerne = asyncHandler(async(req,res)=>{
    try{
        const genreName = req.query.genrename;
        const genreNameRegex = new RegExp('^' + genreName,'i');
        const genre = await Genre.find({
            musicGenre: {$regex: genreNameRegex}
        })
        res.status(200).json({message: "Success", data: genre})
    }
    catch(error){
        res.status(500).json({message: "Internal Server Error"})
    }
})
const changeGerneStatus = asyncHandler(async(req,res)=>{
  try{
    const {musicGenre, isPublic} = req.body;
    Genre.updateOne({_id: req.params.id},{$set: {musicGenre: musicGenre, isPublic: isPublic}})
  }
  catch(ex)
  {
    res.sendStatus(400)
  }
})
module.exports = {findGerne, getMostFamousGerne, changeGerneStatus}