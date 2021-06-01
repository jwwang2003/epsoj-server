import mongoose from 'mongoose'
import timestamps from 'mongoose-timestamp';
import { composeWithMongoose } from 'graphql-compose-mongoose';

/**
 * Name (String)
 * Language (String) : "C++" | "Java" | etc...
 * Type (String) : "Lab" | "Project" | "Test"
 * ContentType (String) : "text" | "mk"
 * Content (String)
 *  Either pure txt or stringified markdown
 * AutoGrade (Boolean)
 * Test Data [{input(raw String), expectedOutput(raw String)}...]
 *  Will be an empty array if autoGrade is disabled
 * Tags (Array) : [String...]
 * Date created, last modified
 */

const AssignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: true
  },
  intendedType: {
    type: String,
    enum: {
      values: ['Lab', 'Project', 'Test'],
      message: 'Please choose between Lab, Project, or Test'
    }
  },
  language: {
    type: String,
    enum: {
      values: ['cpp', 'java'],
      message: '{VALUE} is not supported programming language yet'
    },
    required: true
  },
  contentType: {
    type: String,
    enum: {
      values: ['txt', 'mk'],
      message: '{VALUE} is not supported format'
    },
    required: true
  },
  content: {
    type: String,
    required: true
  },
  testData: {
    type: [{in: String, out:String}],
    default: []
  },
  tags: {
    type: [String],
    default: []
  }
}, { collection: "assignmentBank"})

AssignmentSchema.plugin(timestamps);

AssignmentSchema.index({ createdAt: 1, updatedAt: 1})

export const Assignment = mongoose.model('Assignment', AssignmentSchema);
export const AssignmentTC = composeWithMongoose(Assignment);