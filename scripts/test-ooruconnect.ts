// Unit & Integration Test Suite for OoruConnect
import {
  extractWithLinguisticEngine,
  generateFollowUpQuestions,
  matchAndRankProviders,
  calculateHaversineDistance,
  SAMPLE_PROVIDERS
} from '../src/services/ooruConnectEngine';
import { ParsedHelpRequest, ServiceProvider } from '../src/types/ooruConnect';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

async function runTests() {
  console.log('\n=== OORUCONNECT TEST SUITE ===\n');

  // TEST 1: Tanglish Harvesting Labor Request
  console.log('--- Test 1: Tanglish Harvesting Request ---');
  const req1 = extractWithLinguisticEngine('Naalaikku harvesting-ku 5 workers venum Melur la');
  assert(req1.request_type === 'labor', 'Identified as labor request');
  assert(req1.quantity === 5, 'Extracted quantity = 5');
  assert(req1.unit === 'workers', 'Extracted unit = workers');
  assert(req1.village === 'Melur Village', 'Extracted village = Melur Village');
  assert(req1.required_date !== null, 'Extracted tomorrow date');
  assert(req1.missing_fields.length === 0, 'No missing essential fields');

  // TEST 2: Tanglish Tractor & Rotavator Request
  console.log('\n--- Test 2: Tanglish Tractor & Rotavator Request ---');
  const req2 = extractWithLinguisticEngine('3 acre-ku rotavator tractor venum Vadipatti la');
  assert(req2.request_type === 'equipment', 'Identified as equipment request');
  assert(req2.quantity === 3, 'Extracted quantity = 3');
  assert(req2.unit === 'acres', 'Extracted unit = acres');
  assert(req2.village === 'Vadipatti', 'Extracted village = Vadipatti');
  assert(req2.work_type?.includes('Rotavator') === true, 'Extracted work_type contains Rotavator');

  // TEST 3: Tamil Drip Irrigation Repair
  console.log('\n--- Test 3: Tamil Drip Irrigation Repair ---');
  const req3 = extractWithLinguisticEngine('என் தோட்டத்தில் சொட்டு நீர் பாசனம் பழுது பார்க்க வேண்டும்');
  assert(req3.request_type === 'technician', 'Identified as technician request');
  assert(req3.work_type?.includes('Drip') === true || req3.work_type?.includes('சொட்டு நீர்') === true, 'Identified Drip Irrigation');

  // TEST 4: Incomplete Request with Missing Fields Detection
  console.log('\n--- Test 4: Missing Fields & Follow-up Generation ---');
  const incompleteReq = extractWithLinguisticEngine('Enakku 5 workers venum');
  assert(incompleteReq.quantity === 5, 'Extracted 5 workers');
  assert(incompleteReq.missing_fields.includes('village'), 'Detected missing village');
  assert(incompleteReq.missing_fields.includes('required_date'), 'Detected missing required_date');
  assert(incompleteReq.missing_fields.includes('work_type'), 'Detected missing work_type');

  const followUps = generateFollowUpQuestions(incompleteReq.missing_fields, incompleteReq);
  assert(followUps.length === 3, 'Generated 3 targeted follow-up questions');
  assert(followUps.some(q => q.field === 'work_type'), 'Has work_type question');
  assert(followUps.some(q => q.field === 'village'), 'Has village question');
  assert(followUps.some(q => q.field === 'required_date'), 'Has required_date question');
  assert(followUps[0].suggestions.length > 0, 'Includes 1-tap suggestion chips for rural accessibility');

  // TEST 5: Haversine Distance Calculation Accuracy
  console.log('\n--- Test 5: Distance Calculation Accuracy ---');
  // Melur (10.0333, 78.3333) to Vadipatti (10.0500, 77.9667) is approx 40 km
  const dist = calculateHaversineDistance(10.0333, 78.3333, 10.0500, 77.9667);
  assert(dist > 35 && dist < 45, `Distance Melur-Vadipatti is ${dist}km (expected ~40km)`);

  // TEST 6: Smart Provider Matching & Weighted Ranking
  console.log('\n--- Test 6: Smart Matching & Weighted Scoring ---');
  const completeHarvestReq: ParsedHelpRequest = {
    request_type: 'labor',
    work_type: 'Harvesting (அறுவடை)',
    quantity: 5,
    unit: 'workers',
    required_date: new Date().toISOString().split('T')[0],
    village: 'Melur Village',
    location: { lat: 10.0333, lng: 78.3333 },
    additional_requirements: null,
    missing_fields: [],
    confidence: 0.9,
    raw_input: '5 workers for harvesting in Melur today',
    extraction_source: 'rule_based_fallback'
  };

  const matches = matchAndRankProviders(completeHarvestReq);
  assert(matches.length > 0, 'Found matches for labor request');
  assert(matches[0].provider.id === 'prov_raman_squad', 'Top match is Raman Squad in Melur');
  assert(matches[0].match_score >= 85, `Top match score is ${matches[0].match_score}% (high match)`);
  assert(matches[0].distance_km < 3, `Top match is within 3 km (${matches[0].distance_km} km)`);
  assert(matches[0].score_breakdown.skill_match === 40, 'Full 40% score for exact skill match');
  assert(matches[0].score_breakdown.distance_score === 25, 'Full 25% score for <3km distance');
  assert(matches[0].score_breakdown.availability_score === 20, 'Full 20% score for confirmed availability');
  assert(matches[0].score_breakdown.capacity_score === 10, 'Full 10% score for capacity fulfillment (12 >= 5)');
  assert(matches[0].score_breakdown.verification_score === 5, 'Full 5% score for verified provider');

  // TEST 7: Handling Invalid / Corrupted Provider Pool
  console.log('\n--- Test 7: Handling Corrupted / Invalid Provider Data ---');
  const corruptedProviders: ServiceProvider[] = [
    {
      id: 'prov_corrupt_1',
      name: 'Corrupt Provider',
      service_category: 'labor',
      roleTa: 'Role',
      roleEn: 'Role',
      skills: [],
      village: 'Unknown',
      district: 'Madurai',
      coords: { lat: 0, lng: 0 },
      capacity_number: 0,
      capacity_unit: 'workers',
      capacity_descriptionTa: '',
      capacity_descriptionEn: '',
      availability_status: 'unavailable',
      availability_date: 'today',
      availability_updated_at: '',
      is_verified: false,
      verification_badge: 'community_vouched',
      rating: 0,
      completed_jobs: 0,
      verified_price_rate: null,
      phone: '',
      is_synthetic_demo: true
    }
  ];

  const corruptMatches = matchAndRankProviders(completeHarvestReq, {
    providers: corruptedProviders,
    maxDistanceKm: 20000 // allow far distance to test calculation stability
  });
  assert(corruptMatches.length === 1, 'Corrupted record handled safely without crash');
  assert(corruptMatches[0].score_breakdown.availability_score === 0, 'Unavailable provider gets 0 availability score');
  assert(corruptMatches[0].score_breakdown.skill_match === 25, 'General category match gets 25 pts baseline');

  console.log('\n🎉 ALL 7 TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
