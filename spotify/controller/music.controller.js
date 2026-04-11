const musicModel = require("../model/music.model");
const albumModel = require("../model/album.model");

const { uploadFile } = require("../services/storage.services");

const creatMusic = async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  const result = await uploadFile(file.buffer.toString("base64"));

  const music = await musicModel.create({
    uri: result.url,
    title,
    artist: req.user.id,
  });

  res.status(201).json({
    msg: "music uplaoded successfully",
    music: {
      id: music._id,
      title: music.title,
      uri: music.uri,
      artist: music.artist,
    },
  });
};

const creatAlbum = async (req, res) => {
  const { title, musics } = req.body;

  const album = await albumModel.create({
    title,
    artist: req.user.id,
    musics: musics,
  });

  res.status(200).json({
    msg: "album created successfully",
    album: {
      id: album._id,
      title: album.title,
      artist: album.artist,
      musics: album.musics,
    },
  });
};

const getAllMusic = async (req, res) => {
  const musics = await musicModel.find();
  res.status(200).json({
    msg: "music fetch successfully",
    musics: musics,
  });
};

module.exports = { creatMusic, creatAlbum, getAllMusic };
