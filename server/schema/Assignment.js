import { Assignment, AssignmentTC } from '../models/assignmentBank';

const AssignmentQuery = {
    AssignmentById: AssignmentTC.getResolver('findById'),
    AssignmentByIds: AssignmentTC.getResolver('findByIds'),
    AssignmentOne: AssignmentTC.getResolver('findOne'),
    AssignmentMany: AssignmentTC.getResolver('findMany'),
    AssignmentCount: AssignmentTC.getResolver('count'),
    AssignmentConnection: AssignmentTC.getResolver('connection'),
    AssignmentPagination: AssignmentTC.getResolver('pagination'),
};

const AssignmentMutation = {
    AssignmentCreateOne: AssignmentTC.getResolver('createOne'),
    AssignmentCreateMany: AssignmentTC.getResolver('createMany'),
    AssignmentUpdateById: AssignmentTC.getResolver('updateById'),
    AssignmentUpdateOne: AssignmentTC.getResolver('updateOne'),
    AssignmentUpdateMany: AssignmentTC.getResolver('updateMany'),
    AssignmentRemoveById: AssignmentTC.getResolver('removeById'),
    AssignmentRemoveOne: AssignmentTC.getResolver('removeOne'),
    AssignmentRemoveMany: AssignmentTC.getResolver('removeMany'),
};

export { AssignmentQuery, AssignmentMutation };