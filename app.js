require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const publicRoutes = require("./routes/publicRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

// Teammates will add these later:
// const authRoutes = require("./routes/authRoutes");
// const eventRoutes = require("./routes/eventRoutes");
// const registrationRoutes = require("./routes/registrationRoutes");
// const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));

app.use("/", publicRoutes);

// app.use("/api/auth", authRoutes);
// app.use("/api/events", eventRoutes);
// app.use("/api/registrations", registrationRoutes);
// app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "API route not found",
    });
  }

  return res.status(404).send("Page not found");
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
