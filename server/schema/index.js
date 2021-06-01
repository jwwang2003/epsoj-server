import { SchemaComposer } from 'graphql-compose';

import db from '../utils/db'; // eslint-disable-line no-unused-vars

const schemaComposer = new SchemaComposer();

import { UserQuery, UserMutation } from './user';
import { TaskQuery, TaskMutation } from './task';
import { AssignmentQuery, AssignmentMutation } from './Assignment';

schemaComposer.Query.addFields({
    ...UserQuery,
    ...TaskQuery,
    ...AssignmentQuery,
});

schemaComposer.Mutation.addFields({
    ...UserMutation,
    ...TaskMutation,
    ...AssignmentMutation
});




export default schemaComposer.buildSchema();