
import { parentPort, workerData } from 'worker_threads';
import mongoose from 'mongoose';
import { Note } from './note.model.ts'; // Update this if needed
import { config } from '../../config';
import connectToDb from '../../config/mongoDbConfig.ts';

// Set a timeout for worker execution (30 seconds)
const TIMEOUT = 60000; // 30 seconds 

 let timeout: NodeJS.Timeout;

const timeoutPromise = new Promise((_, reject) => {
  timeout = setTimeout(() => {
    reject(new Error('Aggregation operation timed out'));
  }, TIMEOUT);
});

// This is the worker thread that performs the aggregation logic
async function performAggregation() {
  try {

    await mongoose.connect(config.database.mongoUrl as string,{
      serverSelectionTimeoutMS: 30000,  // increase server selection timeout
      socketTimeoutMS: 45000,  // increase socket timeout
    });
    //  connectToDb();


    const { projectId, startOfDay, endOfDay } = workerData;

  
    // Aggregation to get notes with attachment counts
    const notesWithAttachmentCounts = await Note.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachmentDetails',
        },
      },
      {
        $addFields: {
          imageCount: {
            $size: {
              $filter: {
                input: '$attachmentDetails',
                as: 'att',
                cond: { $eq: ['$$att.attachmentType', 'image'] },
              },
            },
          },
          documentCount: {
            $size: {
              $filter: {
                input: '$attachmentDetails',
                as: 'att',
                cond: { $eq: ['$$att.attachmentType', 'document'] },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          title: 1,
          description: 1,
          isAccepted: 1,
          createdAt: 1,
          imageCount: 1,
          documentCount: 1,
        },
      },
    ]);

    // Global count of images and documents
    const totalCounts = await Note.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachmentDetails',
        },
      },
      {
        $unwind: '$attachmentDetails',
      },
      {
        $group: {
          _id: null,
          totalImages: {
            $sum: {
              $cond: [
                { $eq: ['$attachmentDetails.attachmentType', 'image'] },
                1,
                0,
              ],
            },
          },
          totalDocuments: {
            $sum: {
              $cond: [
                { $eq: ['$attachmentDetails.attachmentType', 'document'] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    console.log("Total counts aggregation completed: 🟢🟢🟢", totalCounts.length);

    // Clear timeout if aggregation completes successfully
    clearTimeout(timeout);

    // Send the result back to the main thread
    parentPort.postMessage({
      notes: notesWithAttachmentCounts,
      imageCount: totalCounts.length ? totalCounts[0].totalImages : 0,
      documentCount: totalCounts.length ? totalCounts[0].totalDocuments : 0,
    });
  } catch (error) {
    // If an error occurs, clear the timeout and send the error message
    clearTimeout(timeout);
    parentPort.postMessage({ error: error.message });
  }
}

// Run the aggregation logic and ensure it races with the timeout
Promise.race([performAggregation(), timeoutPromise])
  .catch((error) => {
    // Handle timeout or aggregation error
    parentPort.postMessage({ error: error.message });
  });



/*
import { config } from '../../config';
const { parentPort, workerData } = require('worker_threads');
const mongoose = require('mongoose');


// const Note = require(' ./models/Note'); // Assuming you have the Note model
import { Note } from './note.model.ts'; // src/modules/note/


// Set a timeout for worker execution
const TIMEOUT = 30000; // 30 seconds

let timeout;
const timeoutPromise = new Promise((_, reject) => {
  timeout = setTimeout(() => {
    reject(new Error("Aggregation operation timed out"));
  }, TIMEOUT);
});



// This is the worker thread that performs the aggregation logic
async function performAggregation() {
  try {

    await mongoose.connect(config.database.mongoUrl as string,{
            serverSelectionTimeoutMS: 30000,  // increase server selection timeout
            socketTimeoutMS: 45000,  // increase socket timeout
          });


    const { projectId, startOfDay, endOfDay } = workerData;

    // Aggregation to get notes with attachment counts
    const notesWithAttachmentCounts = await Note.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachmentDetails',
        },
      },
      {
        $addFields: {
          imageCount: {
            $size: {
              $filter: {
                input: '$attachmentDetails',
                as: 'att',
                cond: { $eq: ['$$att.attachmentType', 'image'] },
              },
            },
          },
          documentCount: {
            $size: {
              $filter: {
                input: '$attachmentDetails',
                as: 'att',
                cond: { $eq: ['$$att.attachmentType', 'document'] },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          isAccepted: 1,
          createdAt: 1,
          imageCount: 1,
          documentCount: 1,
        },
      },
    ]);

    // Global count of images and documents
    const totalCounts = await Note.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachmentDetails',
        },
      },
      {
        $unwind: '$attachmentDetails',
      },
      {
        $group: {
          _id: null,
          totalImages: {
            $sum: {
              $cond: [
                { $eq: ['$attachmentDetails.attachmentType', 'image'] },
                1,
                0,
              ],
            },
          },
          totalDocuments: {
            $sum: {
              $cond: [
                { $eq: ['$attachmentDetails.attachmentType', 'document'] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    console.log("🟢🟢", notesWithAttachmentCounts)

    // Send the result back to the main thread
    parentPort.postMessage({
      notes: notesWithAttachmentCounts,
      imageCount: totalCounts.length ? totalCounts[0].totalImages : 0,
      documentCount: totalCounts.length ? totalCounts[0].totalDocuments : 0,
    });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
}

// Run the aggregation logic
performAggregation();



*/