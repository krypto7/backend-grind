const express = require("express");
const router = express.Router();
const blogController = require("../controller/blog.controller");
const auth = require("../middleware/auth.middleware");

//public
router.get("/blog-list", blogController.blogList);

//protected
router.post("/create-blog", auth, blogController.createBlog);
router.put("/edit-blog/:id", auth, blogController.editBlog);
router.delete("/delete-blog/:id", auth, blogController.deleteBlog);

module.exports = router;
