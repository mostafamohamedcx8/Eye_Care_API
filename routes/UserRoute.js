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
  getDoctors,
  getDoctorById,
  getOpticians,
  deleteDoctorById,
  updateOpticianRole,
  deleteOpticianById,
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
router.route("/doctor").get(authService.allowedTo("optician"), getDoctors);
router
  .route("/doctor/:id")
  .get(authService.allowedTo("optician"), getDoctorById);
router.get("/getMe", getLoggedUserData, getUser);
router.put("/changemypassword", UpdateUserLoggedPassword);
router.put(
  "/updatemydata",
  UploadSingalImage,
  resizeimage,
  updateUserLoggedValidator,
  UpdateLoggedUserData
);
router.delete("/deletme", deletUserLoggedData);

router.use(authService.allowedTo("admin"));
router.route("/doctors").get(getDoctors);
router.route("/opticians").get(getOpticians);
router
  .route("/")
  .post(UploadSingalImage, resizeimage, createUserValidator, createUser)
  .get(getUsers);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .delete(deleteUserValidator, deleteUser)
  .put(UpdateUserValidator, updateUser);
router.route("/doctor/:id").delete(deleteDoctorById);
router.route("/optician/:id").delete(deleteOpticianById);
router.route("/optician/:id").put(updateOpticianRole);
router
  .route("/changePassword/:id")
  .put(changeUserpasswordValidator, changeUserPassword);

module.exports = router;
