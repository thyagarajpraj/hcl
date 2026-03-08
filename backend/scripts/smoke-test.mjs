import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../config/db.js";
import Employee from "../models/Employee.js";
import Feedback from "../models/Feedback.js";

await connectDB();

const createdEmployeeIds = [];
let createdFeedbackId = null;

const server = app.listen(0, async () => {
  const port = server.address().port;
  const runId = Date.now();

  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`).then((response) =>
      response.json()
    );

    const giverResponse = await fetch(`http://127.0.0.1:${port}/api/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `Smoke Giver ${runId}`,
        email: `smoke-giver-${runId}@example.com`,
        department: "QA"
      })
    });

    const giver = await giverResponse.json();

    const receiverResponse = await fetch(`http://127.0.0.1:${port}/api/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `Smoke Receiver ${runId}`,
        email: `smoke-receiver-${runId}@example.com`,
        department: "Engineering"
      })
    });

    const receiver = await receiverResponse.json();

    createdEmployeeIds.push(giver.employee._id, receiver.employee._id);

    const submitResponse = await fetch(`http://127.0.0.1:${port}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        givenBy: giver.employee._id,
        givenTo: receiver.employee._id,
        rating: 5,
        comment: "Excellent collaboration during release planning."
      })
    });

    const submitted = await submitResponse.json();
    createdFeedbackId = submitted.feedback._id;

    const received = await fetch(
      `http://127.0.0.1:${port}/api/feedback/${receiver.employee._id}`
    ).then((response) => response.json());

    const average = await fetch(
      `http://127.0.0.1:${port}/api/feedback/average/${receiver.employee._id}`
    ).then((response) => response.json());

    const deleted = await fetch(
      `http://127.0.0.1:${port}/api/feedback/${submitted.feedback._id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: giver.employee._id
        })
      }
    ).then((response) => response.json());

    console.log(`health=${health.status}:${health.database.status}`);
    console.log(`employees=${createdEmployeeIds.length}`);
    console.log(`feedback=${received.feedback.length}`);
    console.log(`average=${average.avgRating}`);
    console.log(`deleted=${deleted.message}`);
  } finally {
    if (createdFeedbackId) {
      await Feedback.findByIdAndDelete(createdFeedbackId);
    }

    if (createdEmployeeIds.length > 0) {
      await Employee.deleteMany({
        _id: {
          $in: createdEmployeeIds
        }
      });
    }

    await mongoose.disconnect();
    server.close();
  }
});
