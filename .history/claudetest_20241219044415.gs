function getCachedAssessmentData(ss, chataId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `assessment_data_${chataId}`;
  
  // Try to get from cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    Logger.log('Using cached assessment data for ' + chataId);
    return JSON.parse(cachedData);
  }
  
  // If not in cache, retrieve and cache the data
  Logger.log('Retrieving and caching assessment data for ' + chataId);
  const r1Data = getR1Data(ss, chataId);
  const r2Data = getR2Data(ss, chataId);
  const r3Data = getR3Data(ss, chataId);
  
  const assessmentData = {
    r1: {
      ...r1Data,
      chataId: chataId // Ensure CHATA ID is included in the data
    },
    r2: r2Data,
    r3: r3Data
  };
  
  // Cache for 6 hours (21600 seconds)
  cache.put(cacheKey, JSON.stringify(assessmentData), 21600);
  
  return assessmentData;
}

function processAnalysis(chataId, formData) {
  if (!chataId) {
    throw new Error('CHATA_ID is required');
  }

  const isNoChata = chataId === 'NO_CHATA';
  Logger.log(`Processing analysis for ${isNoChata ? 'NO_CHATA case' : 'CHATA_ID: ' + chataId}`);

  // For NO_CHATA case, we'll use only the form data
  if (isNoChata) {
    Logger.log('Using form data only (NO_CHATA case)');
    return {
      success: true,
      message: 'Analysis completed using form data only',
      data: {
        formData: formData,
        r1Data: null,
        r2Data: null
      }
    };
  }

  // Regular case - proceed with R1 and R2 data retrieval
  try {
    // ... rest of the existing function code ...
  } catch (error) {
    Logger.log('Error processing analysis: ' + error);
    return {
      success: false,
      message: 'Error processing analysis',
      error: error.toString()
    };
  }
}