const { z } = require('zod');

const createAssignmentSchema = z.object({
  teacherId: z.string().min(1, 'Enseignant requis'),
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().min(1, 'Matière requise'),
  schoolYear: z.string().min(1, 'Année scolaire requise'),
});

module.exports = { createAssignmentSchema };
