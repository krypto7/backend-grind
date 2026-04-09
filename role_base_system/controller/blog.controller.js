const Blog = require("../model/blog.model");

//blogList:
exports.blogList = async (req, res) => {
  const blogList = await Blog.find();
  res.status(200).json({
    msg: "blog list here",
    blogs: blogList,
  });
};

//create blog
exports.createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({
        msg: "all fields are required",
      });
    }
    const blog = await Blog.create({
      title,
      description,
      author: req.user.userId,
    });

    res.status(201).json({
      msg: "blog created successfully",
      blog,
    });
  } catch (error) {
    res.status(201).json({
      msg: "Error creating te blog",
    });
  }
};

//update blog:
exports.editBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(400).json({ msg: "not found" });
    }

    //Ownership and admin check:
    console.log("====>", blog);

    if (
      blog.author.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ msg: "Not Allowed!!" });
    }

    //update blog:
    blog.title = title || blog.title;
    blog.description = description || blog.description;

    await blog.save();

    res.status(200).json({
      msg: "Blog Updated",
      blog,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error updating blog" });
  }
};

//delete blog

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(400).json({ msg: "blog not found" });
    }
    if (
      blog.author.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({ msg: "not accesable!" });
    }
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ msg: "Blog deleted!!" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting blog" });
  }
};
