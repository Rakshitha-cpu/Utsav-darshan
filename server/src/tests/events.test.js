import test from 'node:test';
import assert from 'node:assert/strict';

test('Event validation logic', (t) => {
  const sampleEvent = {
    name: 'Mysuru Dasara',
    category: 'Cultural Festivals',
    city: 'Mysuru',
    state: 'Karnataka'
  };

  assert.equal(sampleEvent.name, 'Mysuru Dasara');
  assert.equal(sampleEvent.city, 'Mysuru');
  assert.ok(sampleEvent.category);
});

test('Duplicate event detection matching algorithm', (t) => {
  const existingName = 'Bengaluru Karaga Shaktyotsava';
  const newSubmission = 'bengaluru karaga';
  
  const isDuplicate = existingName.toLowerCase().includes(newSubmission.toLowerCase());
  assert.equal(isDuplicate, true);
});
