const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const {
  S3Client,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const {
  SNSClient,
  PublishCommand,
} = require("@aws-sdk/client-sns");

const app = express();

const PORT = 5000;

const AWS_REGION = "ap-south-1";

const S3_BUCKET =
  "yogitha-task-manager-2026-1-018088156681-ap-south-1-an";

// IMPORTANT: Replace this with your actual SNS Topic ARN
const SNS_TOPIC_ARN =
  "arn:aws:sns:ap-south-1:018088156681:task-manager-events";

// =============================
// PostgreSQL
// =============================

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "aws_project",
  password: "sqlpassword",
  port: 5432,
});

// =============================
// AWS S3
// =============================

const s3 = new S3Client({
  region: AWS_REGION,
});

// =============================
// AWS SNS
// =============================

const sns = new SNSClient({
  region: AWS_REGION,
});

// =============================
// Middleware
// =============================

app.use(cors());
app.use(express.json());

// =============================
// Test PostgreSQL connection
// =============================

pool.query("SELECT NOW()", (error) => {
  if (error) {
    console.error(
      "PostgreSQL connection failed:",
      error
    );
  } else {
    console.log(
      "PostgreSQL connected successfully!"
    );
  }
});

// =============================
// GET ALL TASKS
// =============================

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching tasks:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

// =============================
// ADD TASK
// =============================

app.post("/api/tasks", async (req, res) => {
  const { task } = req.body;

  if (!task || task.trim() === "") {
    return res.status(400).json({
      message: "Task cannot be empty",
    });
  }

  try {
    // Save task to PostgreSQL
    const result = await pool.query(
      "INSERT INTO tasks (task) VALUES ($1) RETURNING *",
      [task.trim()]
    );

    const savedTask = result.rows[0];

    console.log(
      "Task saved:",
      savedTask
    );

    // =============================
    // Publish task event to SNS
    // =============================

    try {
      const message = {
        event: "TASK_CREATED",
        task: savedTask,
      };

      await sns.send(
        new PublishCommand({
          TopicArn: SNS_TOPIC_ARN,
          Subject: "Task Created",
          Message: JSON.stringify(message),
        })
      );

      console.log(
        "SNS message published successfully!"
      );
    } catch (snsError) {
      console.error(
        "SNS publish failed:",
        snsError
      );
    }

    res.json({
      message: "Task added successfully",
      task: savedTask,
    });
  } catch (error) {
    console.error(
      "Error adding task:",
      error
    );

    res.status(500).json({
      message: "Failed to add task",
    });
  }
});

// =============================
// EDIT TASK
// =============================

app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  if (!task || task.trim() === "") {
    return res.status(400).json({
      message: "Task cannot be empty",
    });
  }

  try {
    const result = await pool.query(
      "UPDATE tasks SET task = $1 WHERE id = $2 RETURNING *",
      [task.trim(), id]
    );

    console.log(
      "Task updated:",
      result.rows[0]
    );

    res.json({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error updating task:",
      error
    );

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

// =============================
// DELETE TASK
// =============================

app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    );

    console.log(
      "Task deleted:",
      id
    );

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting task:",
      error
    );

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

// =============================
// COMPLETE / UNCOMPLETE TASK
// =============================

app.put(
  "/api/tasks/:id/completed",
  async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    try {
      const result = await pool.query(
        "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *",
        [completed, id]
      );

      console.log(
        "Task status updated:",
        result.rows[0]
      );

      res.json({
        message: "Task status updated",
        task: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Error updating task status:",
        error
      );

      res.status(500).json({
        message: "Failed to update task status",
      });
    }
  }
);

// =============================
// TEST S3 CONNECTION
// =============================

app.get("/api/s3-test", async (req, res) => {
  try {
    const testKey =
      "test/connection.txt";

    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: testKey,
        Body:
          "Task Manager S3 connection successful!",
        ContentType: "text/plain",
      })
    );

    console.log(
      "S3 test upload successful!"
    );

    res.json({
      message:
        "S3 connection successful!",
      bucket: S3_BUCKET,
      file: testKey,
    });
  } catch (error) {
    console.error(
      "S3 connection failed:",
      error
    );

    res.status(500).json({
      message: "S3 connection failed",
      error: error.message,
    });
  }
});

// =============================
// START SERVER
// =============================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});