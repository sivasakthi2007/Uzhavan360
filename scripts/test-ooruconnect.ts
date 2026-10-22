// Comprehensive Unit & Integration Test Suite for OoruConnect
import {
  extractWithLinguisticEngine,
  generateFollowUpQuestions,
  matchAndRankProviders,
  calculateHaversineDistance,
  getLocalDateString,
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
  console.log('\n========================================');
  console.log('   OORUCONNECT VERIFICATION TEST SUITE  ');
  console.log('========================================\n');

  // SCENARIO 1: Tamil typed request
  console.log('--- Scenario 1: Tamil Typed Request ("நாளைக்கு 5 பேர் அறுவடைக்கு வேண்டும்") ---');
  const tamilReq = extractWithLinguisticEngine('நாளைக்கு 5 பேர் அறுவடைக்கு வேண்டும்');
  assert(tamilReq.service_category === 'labor', 'service_category is labor');
  assert(tamilReq.quantity === 5, 'quantity is 5');
  assert(tamilReq.unit === 'workers', 'unit is workers');
  assert(tamilReq.required_date === getLocalDateString(1), `required_date is tomorrow's local date (${getLocalDateString(1)})`);
  assert(!tamilReq.missing_fields.includes('required_date'), 'required_date is NOT marked missing');
  assert(tamilReq.missing_fields.includes('village'), 'village is correctly identified as missing');

  // SCENARIO 2: Tanglish typed request ("Naalaikku harvesting-ku 5 workers venum")
  console.log('\n--- Scenario 2: Tanglish Typed Request ("Naalaikku harvesting-ku 5 workers venum") ---');
  const tanglishReq1 = extractWithLinguisticEngine('Naalaikku harvesting-ku 5 workers venum');
  assert(tanglishReq1.service_category === 'labor', 'service_category is labor');
  assert(tanglishReq1.work_type?.includes('Harvesting') === true, 'work_type is Harvesting');
  assert(tanglishReq1.quantity === 5, 'quantity is 5');
  assert(tanglishReq1.unit === 'workers', 'unit is workers');
  assert(tanglishReq1.required_date === getLocalDateString(1), `required_date is tomorrow (${getLocalDateString(1)})`);
  assert(!tanglishReq1.missing_fields.includes('required_date'), 'date is recognized so NOT in missing_fields');
  assert(tanglishReq1.missing_fields.includes('village'), 'village is in missing_fields');

  // SCENARIO 2b: Tanglish Equipment Request ("3 acre-ku rotavator tractor venum")
  console.log('\n--- Scenario 2b: Tanglish Equipment Request ("3 acre-ku rotavator tractor venum") ---');
  const rotavatorReq = extractWithLinguisticEngine('3 acre-ku rotavator tractor venum');
  assert(rotavatorReq.service_category === 'equipment', 'service_category is equipment');
  assert(rotavatorReq.work_type?.includes('Rotavator') === true, 'work_type includes Rotavator');
  assert(rotavatorReq.quantity === 3, 'quantity is 3');
  assert(rotavatorReq.unit === 'acres', 'unit is acres');
  assert(rotavatorReq.missing_fields.includes('required_date'), 'required_date is missing');
  assert(rotavatorReq.missing_fields.includes('village'), 'village is missing');

  // SCENARIO 2c: Tanglish/Tamil Irrigation Repair ("En drip irrigation repair pannanum")
  console.log('\n--- Scenario 2c: Irrigation Repair Request ("En drip irrigation repair pannanum") ---');
  const dripReq = extractWithLinguisticEngine('En drip irrigation repair pannanum');
  assert(dripReq.service_category === 'technician', 'service_category is technician');
  assert(dripReq.work_type?.includes('Drip') === true, 'work_type includes Drip irrigation');
  assert(dripReq.quantity === null, 'quantity is not specified (null)');
  assert(dripReq.missing_fields.includes('village'), 'village is missing');
  assert(dripReq.missing_fields.includes('required_date'), 'date is missing');

  // SCENARIO 3 & 6: Empty or Unclear Request Handling
  console.log('\n--- Scenario 3 & 6: Empty or Unclear Request Handling ---');
  const emptyReq = extractWithLinguisticEngine('');
  assert(emptyReq.raw_input === '', 'Raw input captured');
  assert(emptyReq.missing_fields.length >= 2, 'Detects multiple missing fields');
  assert(emptyReq.service_category === 'general', 'Default fallback category set to general');

  const vagueReq = extractWithLinguisticEngine('hello உதவி வேண்டும்');
  assert(vagueReq.missing_fields.includes('work_type'), 'Flags work_type missing for vague request');
  assert(vagueReq.missing_fields.includes('village'), 'Flags village missing for vague request');

  // SCENARIO 7: Dynamic Follow-Up Generation (Never re-ask date if already provided!)
  console.log('\n--- Scenario 7: Dynamic Follow-Up Generation ---');
  // For req with date present:
  const followUpsForReq1 = generateFollowUpQuestions(tanglishReq1.missing_fields, tanglishReq1);
  assert(!followUpsForReq1.some(q => q.field === 'required_date'), 'DOES NOT ask for date if date was already present');
  assert(followUpsForReq1.some(q => q.field === 'village'), 'Asks for village because village is missing');

  // For req with missing date:
  const followUpsForDrip = generateFollowUpQuestions(dripReq.missing_fields, dripReq);
  assert(followUpsForDrip.some(q => q.field === 'required_date'), 'Asks for date when date is missing');
  const dateQ = followUpsForDrip.find(q => q.field === 'required_date');
  assert(dateQ?.suggestions.length === 3, 'Date question provides Today, Tomorrow, and In 3 Days suggestions');

  // SCENARIO 8: Request with No Matching Providers
  console.log('\n--- Scenario 8: Request with No Matching Providers ---');
  const unmatchedReq: ParsedHelpRequest = {
    request_type: 'transport',
    service_category: 'transport',
    work_type: 'Heavy Crane',
    quantity: 1,
    unit: 'hours',
    required_date: getLocalDateString(0),
    village: 'Remote Desert 999',
    radius_km: 5,
    location: { lat: 13.0827, lng: 80.2707 }, // Far away in Chennai
    additional_requirements: null,
    missing_fields: [],
    confidence: 0.9,
    raw_input: 'Heavy crane needed in Chennai',
    extraction_source: 'rule_based_fallback',
    is_llm_configured: false
  };

  const noMatches = matchAndRankProviders(unmatchedReq, { maxDistanceKm: 10 });
  assert(noMatches.length === 0, 'Returns empty array when no providers are within radius/category');

  // SCENARIO 9: LLM Fallback Transparency
  console.log('\n--- Scenario 9: Fallback Transparency & Confidence Calculation ---');
  assert(tanglishReq1.extraction_source === 'rule_based_fallback', 'Explicitly labels extraction_source as rule_based_fallback');
  assert(tanglishReq1.is_llm_configured === false, 'Labels is_llm_configured as false when no key is set');
  assert(tanglishReq1.confidence !== 0.8, 'Confidence is NOT hardcoded to 80%');
  assert(tanglishReq1.confidence === null, 'Confidence is null when uncalibrated, prompting "விவரங்கள் புரிந்துகொள்ளப்பட்டன"');

  // SCENARIO 10: Successful Parsing Followed by Provider Matching
  console.log('\n--- Scenario 10: Successful Parsing Followed by Provider Matching ---');
  const fullHarvestReq = extractWithLinguisticEngine('Naalaikku harvesting-ku 5 workers venum Melur la');
  assert(fullHarvestReq.village === 'Melur Village', 'Extracted village is Melur Village');
  assert(fullHarvestReq.location !== null, 'Assigned location coordinates for Melur');

  const harvestMatches = matchAndRankProviders(fullHarvestReq);
  assert(harvestMatches.length > 0, 'Found matching providers for harvesting in Melur');
  assert(harvestMatches[0].provider.id === 'prov_raman_squad', 'Top match is Raman Squad');
  assert(harvestMatches[0].match_score >= 80, `Top match score is ${harvestMatches[0].match_score}%`);
  assert(harvestMatches[0].provider.is_synthetic_demo === true, 'Provider is clearly marked as demo dataset');
  assert(harvestMatches[0].score_breakdown.skill_match === 40, 'Score includes 40% skill match');
  assert(harvestMatches[0].score_breakdown.distance_score === 25, 'Score includes 25% distance score (< 3km)');
  assert(harvestMatches[0].score_breakdown.availability_score >= 15, 'Score includes active availability score (15/20 since availability date confirmation advised)');
  assert(harvestMatches[0].score_breakdown.capacity_score === 10, 'Score includes 10% capacity match (12 >= 5)');
  assert(harvestMatches[0].score_breakdown.verification_score === 5, 'Score includes 5% verified provider score');

  // Distance accuracy check
  const dist = calculateHaversineDistance(10.0333, 78.3333, 10.0500, 77.9667);
  assert(dist > 35 && dist < 45, `Haversine distance Melur to Vadipatti is ${dist.toFixed(1)} km`);

  console.log('\n========================================');
  console.log('   🎉 ALL 10 SCENARIO TESTS PASSED!     ');
  console.log('========================================\n');
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});

