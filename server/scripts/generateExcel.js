import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const OUT_PATH = path.join(DATA_DIR, 'applications.xlsx');

const applications = [
  { passport_number: 'GB1234567', applicant_name: 'Oliver Bennett',   visa_type: 'Tourist',  status: 'approved',   decision_date: '2026-05-12' },
  { passport_number: 'GB2345678', applicant_name: 'Amelia Clarke',    visa_type: 'Business',  status: 'processing', decision_date: '' },
  { passport_number: 'GB3456789', applicant_name: 'Harry Walsh',      visa_type: 'Student',   status: 'pending',    decision_date: '' },
  { passport_number: 'GB4567890', applicant_name: 'Sophia Turner',    visa_type: 'Tourist',   status: 'rejected',   decision_date: '2026-04-30' },
  { passport_number: 'US5678901', applicant_name: 'James Carter',     visa_type: 'Work',      status: 'approved',   decision_date: '2026-05-20' },
  { passport_number: 'US6789012', applicant_name: 'Emma Rodriguez',   visa_type: 'Tourist',   status: 'processing', decision_date: '' },
  { passport_number: 'US7890123', applicant_name: 'William Lee',      visa_type: 'Business',  status: 'pending',    decision_date: '' },
  { passport_number: 'US8901234', applicant_name: 'Isabella Nguyen',  visa_type: 'Student',   status: 'approved',   decision_date: '2026-06-01' },
  { passport_number: 'IN9012345', applicant_name: 'Aarav Sharma',     visa_type: 'Work',      status: 'rejected',   decision_date: '2026-03-15' },
  { passport_number: 'IN0123456', applicant_name: 'Diya Patel',       visa_type: 'Tourist',   status: 'approved',   decision_date: '2026-05-28' },
  { passport_number: 'IN1122334', applicant_name: 'Vihaan Gupta',     visa_type: 'Student',   status: 'processing', decision_date: '' },
  { passport_number: 'IN2233445', applicant_name: 'Ananya Reddy',     visa_type: 'Business',  status: 'pending',    decision_date: '' },
  { passport_number: 'CA3344556', applicant_name: 'Liam Tremblay',    visa_type: 'Tourist',   status: 'approved',   decision_date: '2026-06-03' },
  { passport_number: 'CA4455667', applicant_name: 'Charlotte Roy',    visa_type: 'Work',      status: 'rejected',   decision_date: '2026-04-10' },
  { passport_number: 'CA5566778', applicant_name: 'Noah Gagnon',      visa_type: 'Student',   status: 'processing', decision_date: '' },
  { passport_number: 'AU6677889', applicant_name: 'Mia Wilson',       visa_type: 'Business',  status: 'approved',   decision_date: '2026-05-09' },
  { passport_number: 'AU7788990', applicant_name: 'Jack Thompson',    visa_type: 'Tourist',   status: 'pending',    decision_date: '' },
  { passport_number: 'AU8899001', applicant_name: 'Grace Martin',     visa_type: 'Work',      status: 'approved',   decision_date: '2026-06-07' },
  { passport_number: 'ZA9900112', applicant_name: 'Daniel Botha',     visa_type: 'Student',   status: 'rejected',   decision_date: '2026-02-22' },
  { passport_number: 'ZA1011121', applicant_name: 'Lerato Dlamini',   visa_type: 'Business',  status: 'processing', decision_date: '' },
];

const freeUsers = [
  { email: 'free.user@example.com' },
  { email: 'demo@evisa.example' },
  { email: 'tester@gov.example' },
];

fs.mkdirSync(DATA_DIR, { recursive: true });

const workbook = xlsx.utils.book_new();
const appsSheet = xlsx.utils.json_to_sheet(applications, {
  header: ['passport_number', 'applicant_name', 'visa_type', 'status', 'decision_date'],
});
const freeSheet = xlsx.utils.json_to_sheet(freeUsers, { header: ['email'] });

xlsx.utils.book_append_sheet(workbook, appsSheet, 'applications');
xlsx.utils.book_append_sheet(workbook, freeSheet, 'free_users');

xlsx.writeFile(workbook, OUT_PATH);

console.log(`Wrote ${applications.length} applications and ${freeUsers.length} free users to ${OUT_PATH}`);
