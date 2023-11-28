require('dotenv').config();
const MusicGenre = require('../model/GenreModel')
const asyncHandler = require('express-async-handler')

const get20MostFamousGerne = asyncHandler(async(req,res)=>{
    try {
        const genre = await MusicGenre.find({}) // Tìm tất cả bản nhạc
          .sort({ musicQuantity: -1 }) // Sắp xếp theo trường lượt nghe (giảm dần)
          .limit(20); // Giới hạn kết quả trả về cho 50 bản nhạc đầu tiên
        res.status(200).json({message: "Success", data: genre}); // Trả về kết quả top 50 bản nhạc được nghe nhiều nhất
      } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' }); // Xử lý lỗi nếu có
      }
})
const findGerne = asyncHandler(async(req,res)=>{
    try{
        const genreName = req.query.genrename;
        const genreNameRegex = new RegExp('^' + genreName,'i');
        const genre = await MusicGenre.find({
            musicGenre: {$regex: genreNameRegex}
        })
        res.status(200).json({message: "Success", data: genre})
    }
    catch(error){
        res.status(500).json({message: "Internal Server Error"})
    }
})
module.exports = {findGerne, get20MostFamousGerne}