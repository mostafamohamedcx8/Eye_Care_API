// Dependencies
const Patient = require("../models/patientModel"); // Adjust the path to your Patient schema
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const ApiFeatures = require("../utils/apiFeatures");
const ReportOfPatient = require("../models/reportModel");

// ==========================
// 🔹 Create Patient
// ==========================
exports.createPatient = asyncHandler(async (req, res, next) => {
  // Check if the logged-in user is an optician
  if (req.user.role !== "optician") {
    return next(new ApiError("Only opticians can create patients", 403));
  }

  const patientData = {
    ...req.body,
    optician: req.user._id, // Set the optician to the logged-in user
  };

  const patient = await Patient.create(patientData);

  res.status(201).json({
    message: "Patient created successfully",
    data: patient,
  });
});

// ==========================
// 🔹 Get All Patients (Admin)
// ==========================
exports.getPatients = asyncHandler(async (req, res) => {
  const countDocuments = await Patient.countDocuments();
  const apiFeatures = new ApiFeatures(Patient.find(), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();
  const { paginationresults, mongooseQuery } = apiFeatures;
  const patients = await mongooseQuery;

  res.status(200).json({
    results: patients.length,
    paginationresults,
    data: patients,
  });
});

// ==========================
// 🔹 Delete Patient (Admin)
// ==========================
exports.deletePatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findByIdAndDelete(id);

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }

  res.status(204).send(); // Removed redundant deleteOne
});

// ==========================
// 🔹 Get Single Patient (Admin)
// ==========================
exports.getPatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findById(id);

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }
  res.status(200).json({ data: patient });
});

// ==========================
// 🔹 Get Logged-in User's Patients
// ==========================
// exports.getMyPatients = asyncHandler(async (req, res) => {
//   const opticianId = req.user._id; // استخرج الـ ID من الـ JWT middleware مثلاً

//   const countDocuments = await Patient.countDocuments({
//     optician: opticianId,
//   });

//   const apifeatures = new ApiFeatures(
//     Patient.find({ optician: opticianId }),
//     req.query
//   )
//     .filter()
//     .paginate(countDocuments)
//     .sort()
//     .Limitfields()
//     .search();

//   const { paginationresults, mongooseQuery } = apifeatures;
//   const myPatients = await mongooseQuery;

//   res.status(200).json({
//     results: myPatients.length,
//     paginationresults,
//     data: myPatients,
//   });
// });

// ==========================
// 🔹 Get Single Patient for Logged-in User
// ==========================
exports.getMyPatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findOne({
    _id: id,
    optician: req.user._id, // Changed from user to optician
  });

  if (!patient) {
    return next(
      new ApiError(
        "No patient found with this ID for the logged-in optician",
        404
      )
    );
  }

  res.status(200).json({ data: patient });
});

exports.getMyPatientWithReports = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const role = req.user.role;

  let query = { _id: id };

  if (role === "optician") {
    query.optician = userId;
  } else if (role === "doctor") {
    query["doctors.doctor"] = userId;
  } else {
    return next(new ApiError("You are not authorized", 403));
  }

  const patient = await Patient.findOne(query);

  if (!patient) {
    return next(
      new ApiError("No patient found with this ID for the logged-in user", 404)
    );
  }

  const reports = await ReportOfPatient.find({
    _id: { $in: patient.report },
  });

  const patientObj = patient.toObject();
  patientObj.reports = reports;

  res.status(200).json({ data: patientObj });
});

exports.deleteMyPatient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const patient = await Patient.findByIdAndDelete({
    _id: id,
    optician: req.user._id,
  });

  if (!patient) {
    return next(new ApiError(`No patient for this id ${id}`, 404));
  }

  // Trigger "remove" event when update document
  await patient.deleteOne();
  res.status(204).send();
});

exports.updateMypatient = asyncHandler(async (req, res, next) => {
  // Check if the logged-in user is an optician
  if (req.user.role !== "optician") {
    return next(new ApiError("Only opticians can update patients", 403));
  }

  const { id } = req.params;

  // Find the patient by ID and ensure it belongs to the logged-in optician
  const patient = await Patient.findOne({
    _id: id,
    optician: req.user._id,
  });

  if (!patient) {
    return next(
      new ApiError(
        "No patient found with this ID for the logged-in optician",
        404
      )
    );
  }

  // Update patient with new data
  const updatedPatient = await Patient.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    message: "Patient updated successfully",
    data: updatedPatient,
  });
});

exports.sendPatientToDoctor = asyncHandler(async (req, res, next) => {
  const { patientId, doctorId } = req.body;
  const opticianId = req.user._id;

  const patient = await Patient.findOne({
    _id: patientId,
    optician: opticianId, // تأكيد إن المريض ملك الاوبتيشن
  });

  if (!patient) {
    return next(new ApiError("Patient not found or not yours", 404));
  }

  // تحقق إذا الدكتور موجود بالفعل في مصفوفة الأطباء
  if (patient.doctors.includes(doctorId)) {
    return next(
      new ApiError("This patient is already assigned to this doctor", 400)
    );
  }

  // أضف الدكتور إلى المصفوفة
  patient.doctors.push({ doctor: doctorId });
  await patient.save();

  res.status(200).json({
    message: "Patient successfully sent to doctor",
    patient,
  });
});

// exports.getMyPatients = asyncHandler(async (req, res, next) => {
//   const userId = req.user._id;
//   const role = req.user.role;

//   let query = {};

//   if (role === "optician") {
//     query = { optician: userId };
//   } else if (role === "doctor") {
//     query = { doctors: userId };
//   } else {
//     return next(
//       new ApiError("You are not authorized to access this resource", 403)
//     );
//   }

//   // حساب عدد المرضى المناسبين للفلترة
//   const countDocuments = await Patient.countDocuments(query);

//   // تجهيز الاستعلام بالـ features
//   const apifeatures = new ApiFeatures(Patient.find(query), req.query)
//     .filter()
//     .paginate(countDocuments)
//     .sort()
//     .Limitfields()
//     .search();

//   const { paginationresults, mongooseQuery } = apifeatures;
//   const myPatients = await mongooseQuery;

//   res.status(200).json({
//     results: myPatients.length,
//     paginationresults,
//     data: myPatients,
//   });
// });

exports.getMyPatients = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  let query = {};

  if (role === "optician") {
    // استعلام لكل المرضى اللي أنشأهم الـ optician ومش معمولهم أرشفة من جانبه
    query = {
      optician: userId,
      archivedByOptician: false,
    };
  } else if (role === "doctor") {
    // استعلام لكل المرضى اللي فيهم الدكتور ده ومش معمولهم أرشفة من جانبه
    query = {
      doctors: {
        $elemMatch: {
          doctor: userId,
          archived: false,
        },
      },
    };
  } else {
    return next(
      new ApiError("You are not authorized to access this resource", 403)
    );
  }

  const countDocuments = await Patient.countDocuments(query);

  const apifeatures = new ApiFeatures(Patient.find(query), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();

  const { paginationresults, mongooseQuery } = apifeatures;
  const myPatients = await mongooseQuery;

  res.status(200).json({
    results: myPatients.length,
    paginationresults,
    data: myPatients,
  });
});

exports.getArchivedPatients = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  let query = {};

  if (role === "optician") {
    // المرضى اللي أنشأهم الـ optician ومأرشفهم
    query = {
      optician: userId,
      archivedByOptician: true,
    };
  } else if (role === "doctor") {
    // المرضى اللي فيهم الدكتور ده ومأرشفهم
    query = {
      doctors: {
        $elemMatch: {
          doctor: userId,
          archived: true,
        },
      },
    };
  } else {
    return next(
      new ApiError("You are not authorized to access this resource", 403)
    );
  }

  const countDocuments = await Patient.countDocuments(query);

  const apifeatures = new ApiFeatures(Patient.find(query), req.query)
    .filter()
    .paginate(countDocuments)
    .sort()
    .Limitfields()
    .search();

  const { paginationresults, mongooseQuery } = apifeatures;
  const archivedPatients = await mongooseQuery;

  res.status(200).json({
    results: archivedPatients.length,
    paginationresults,
    data: archivedPatients,
  });
});

exports.toggleArchivePatient = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { id: patientId } = req.params;
  // التحقق من وجود المريض
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new ApiError("Patient not found", 404));
  }

  let updatedPatient;

  if (role === "optician") {
    // التحقق من أن الـ optician هو من أنشأ المريض
    if (patient.optician._id.toString() !== userId.toString()) {
      console.log(patient.optician._id.toString());

      return next(
        new ApiError("You are not authorized to archive this patient", 403)
      );
    }

    // تبديل حالة الأرشفة للـ optician
    const newArchiveStatus = !patient.archivedByOptician;
    updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      { archivedByOptician: newArchiveStatus },
      { new: true }
    );
  } else if (role === "doctor") {
    // البحث عن الدكتور في قائمة الأطباء للمريض
    const doctorIndex = patient.doctors.findIndex(
      (doc) => doc.doctor.toString() === userId.toString()
    );
    console.log(patient.doctors);
    console.log(userId);

    if (doctorIndex === -1) {
      return next(new ApiError("You are not assigned to this patient", 403));
    }

    // تبديل حالة الأرشفة للدكتور
    const currentArchiveStatus = patient.doctors[doctorIndex].archived || false;
    const newArchiveStatus = !currentArchiveStatus;

    updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      { [`doctors.${doctorIndex}.archived`]: newArchiveStatus },
      { new: true }
    );
  } else {
    return next(
      new ApiError("You are not authorized to access this resource", 403)
    );
  }

  // إرسال الاستجابة
  const action =
    role === "optician"
      ? updatedPatient.archivedByOptician
        ? "archived"
        : "unarchived"
      : updatedPatient.doctors.find(
          (doc) => doc.doctor.toString() === userId.toString()
        ).archived
      ? "archived"
      : "unarchived";

  res.status(200).json({
    status: "success",
    message: `Patient ${action} successfully`,
    data: updatedPatient,
  });
});

exports.getAllPatientReportStatsByDoctor = asyncHandler(
  async (req, res, next) => {
    const userId = req.user._id;
    const role = req.user.role;

    if (role !== "doctor") {
      return next(new ApiError("Only doctors are authorized", 403));
    }

    // 1. هات كل المرضى المرتبطين بالدكتور
    const patients = await Patient.find({
      "doctors.doctor": userId,
    }).populate("report");

    const result = [];

    for (const patient of patients) {
      let withFeedback = 0;
      let withoutFeedback = 0;

      // 2. لكل تقرير عند المريض
      for (const report of patient.report) {
        const hasFeedback = report.doctorFeedbacks.some(
          (fb) => fb.doctor._id.toString() === userId.toString()
        );

        if (hasFeedback) {
          withFeedback++;
        } else {
          withoutFeedback++;
        }
      }

      result.push({
        patientId: patient._id,
        patientName: `${patient.firstname} ${patient.lastname}`,
        totalReports: patient.report.length,
        reportsWithFeedback: withFeedback,
        reportsWithoutFeedback: withoutFeedback,
      });
    }

    res.status(200).json({ data: result });
  }
);
