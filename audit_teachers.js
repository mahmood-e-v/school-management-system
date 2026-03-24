
const mongoose = require('mongoose');

async function auditData() {
  try {
    const uri = 'mongodb://localhost:27017/school-management-system';
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    
    console.log('--- SCHOOL SETTINGS ---');
    const school = await db.collection('schools').findOne({});
    const signatureNames = [];
    if (school) {
        console.log('Global Class Teacher Signature (Old Field):', !!school.classTeacherSignature);
        console.log('Class Teacher Signatures (New Array):');
        if (school.classTeacherSignatures && school.classTeacherSignatures.length > 0) {
            school.classTeacherSignatures.forEach(s => {
                signatureNames.push(s.teacherName);
                console.log(`- Name: "${s.teacherName}" (Length: ${s.teacherName.length}), Has Signature: ${!!s.signature}`);
            });
        } else {
            console.log('  (Array is empty)');
        }
    }

    console.log('\n--- CLASSES (Active Year Only) ---');
    const activeYear = school?.currentAcademicYear || "2025-26";
    const classes = await db.collection('classes').find({ academicYear: activeYear }).toArray();
    if (classes.length > 0) {
        classes.forEach(c => {
            const classTeacher = c.classTeacher || "";
            const match = signatureNames.find(sn => sn === classTeacher);
            console.log(`- Class: ${c.name} ${c.division}, Teacher: "${classTeacher}" (Len: ${classTeacher.length}), Match Found: ${!!match}`);
        });
    } else {
        console.log(`No classes found for year ${activeYear}.`);
    }

    console.log('\n--- RECENT RESULTS (Checking teacher info in reports if any) ---');
    // Just to see if teacher info is somehow baked into report data... 
    // Usually it's calculated on flight but let's see.

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

auditData();
