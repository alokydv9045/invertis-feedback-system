
import mongoose from 'mongoose';

// Mock the in-memory store and logic from db.js
const inMemoryStore = {
  User: [
    { email: 'admin@test.com', college_id: '123', role: 'admin' },
    { email: 'student@test.com', college_id: '456', role: 'student' }
  ]
};

function filterMatches(item, query) {
  if (!query || Object.keys(query).length === 0) return true;
  
  if (query.$or && Array.isArray(query.$or)) {
    return query.$or.some(subQuery => filterMatches(item, subQuery));
  }

  return Object.entries(query).every(([key, value]) => {
    if (value && typeof value === 'object' && '$in' in value) {
      const inArray = Array.isArray(value.$in) ? value.$in.map(v => v.toString()) : [];
      return inArray.includes(item[key]?.toString());
    }
    return item[key]?.toString() === value?.toString();
  });
}

const testOr = (identifier) => {
  const query = {
    $or: [
      { email: identifier },
      { college_id: identifier }
    ]
  };
  const result = inMemoryStore.User.filter(item => filterMatches(item, query));
  console.log(`Searching for: ${identifier} -> Found:`, result.length);
};

testOr('admin@test.com'); // Should find 1
testOr('123');           // Should find 1
testOr('456');           // Should find 1
testOr('student@test.com'); // Should find 1
testOr('unknown');       // Should find 0
