const express = require("express");

const {
  createUser,
  getUsers,
  getUser,
  deleteUser,
  UploadSingalImage,
  resizeimage,
  updateUser,
  changeUserPassword,
  getLoggedUserData,
  UpdateLoggedUserData,
  UpdateUserLoggedPassword,
  deletUserLoggedData,
} = require("../services/userService");
const authService = require("../services/authService");

const {
  createUserValidator,
  getUserValidator,
  deleteUserValidator,
  UpdateUserValidator,
  changeUserpasswordValidator,
  updateUserLoggedValidator,
} = require("../utils/validation/UserValidation");

const router = express.Router();

router.use(authService.protect);
router.get("/getMe", getLoggedUserData, getUser);
router.put("/changemypassword", UpdateUserLoggedPassword);
router.put("/updatemydata", updateUserLoggedValidator, UpdateLoggedUserData);
router.delete("/deletme", deletUserLoggedData);

router.use(authService.allowedTo("admin"));
router
  .route("/")
  .post(UploadSingalImage, resizeimage, createUserValidator, createUser)
  .get(getUsers);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .delete(deleteUserValidator, deleteUser)
  .put(UpdateUserValidator, updateUser);

router
  .route("/changePassword/:id")
  .put(changeUserpasswordValidator, changeUserPassword);

module.exports = router;
