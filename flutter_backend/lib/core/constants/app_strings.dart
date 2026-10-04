enum AppLanguage { ta, en }

class AppStrings {
  static AppLanguage currentLanguage = AppLanguage.ta;

  static void setLanguage(AppLanguage lang) {
    currentLanguage = lang;
  }

  static bool get isTamil => currentLanguage == AppLanguage.ta;

  // App Title
  static String get appName => 'Ooru Connect';
  static String get tagLine => isTamil 
      ? 'கிராமத்து வேலைக்குழு & மெக்கானிக் இணைப்பு' 
      : 'Instant Labour Squad & Technician Dispatch';

  // Role Selection
  static String get selectLanguage => isTamil ? 'மொழியினை தேர்ந்தெடுக்கவும்' : 'Select Language';
  static String get chooseRole => isTamil ? 'நீங்கள் யார்?' : 'Choose Your Role';
  static String get needWork => isTamil ? 'வேலை தேவை (User)' : 'Need Labour / Service (User)';
  static String get needWorkSub => isTamil ? 'ஆட்கள் அல்லது மெக்கானிக் தேவை' : 'Find Workers or Technicians';
  static String get provideWork => isTamil ? 'வேலை செய்ய வருகிறேன் (Provider)' : 'I Provide Service (Maistry / Tech)';
  static String get provideWorkSub => isTamil ? 'மேஸ்திரி / மெக்கானிக் / ஆபரேட்டர்' : 'Maistry, Mechanic, Driver';

  // Auth & Profile
  static String get loginTitle => isTamil ? 'உள்நுழைய / பதிவு செய்ய' : 'Login / Register';
  static String get enterPhone => isTamil ? 'கைப்பேசி எண்' : 'Phone Number';
  static String get enterName => isTamil ? 'உங்கள் பெயர்' : 'Full Name';
  static String get selectVillage => isTamil ? 'உங்கள் கிராமம்' : 'Select Your Village';
  static String get continueBtn => isTamil ? 'தொடரவும்' : 'Continue';

  // Home Screen
  static String get demandHomeTitle => isTamil ? 'ஊர் கணெக்ட்' : 'Ooru Connect';
  static String get quickActions => isTamil ? 'முக்கிய தேவைகள்' : 'Quick Actions';
  static String get labourSquadNeed => isTamil ? 'வேலைக்குழு தேவை' : 'Need Labour Squad';
  static String get labourSquadSub => isTamil ? 'அறுவடை, நற்று நடுதல், சுமை தூக்குதல்' : 'Harvest, Weeding, Masonry Squads';
  static String get technicianNeed => isTamil ? 'Technician தேவை' : 'Need Technician';
  static String get technicianSub => isTamil ? 'மோட்டார் மெக்கானிக், எலக்ட்ரீஷியன், டிராக்டர்' : 'Motor Mechanic, Electrician, Operator';
  
  static String get myRequests => isTamil ? 'என் கோரிக்கைகள்' : 'My Requests';
  static String get nearbyAvailable => isTamil ? 'அருகில் உள்ளவர்கள்' : 'Nearby Available';
  static String get vouchesTitle => isTamil ? 'நம்பிக்கை சான்றுகள் (Vouches)' : 'Village Vouches';
  static String get profileTitle => isTamil ? 'என் சுயவிவரம்' : 'My Profile';

  // Labour Form
  static String get labourFormTitle => isTamil ? 'வேலைக்குழு தேவை பதிவு' : 'Labour Squad Request';
  static String get workType => isTamil ? 'வேலை வகை' : 'Work Type';
  static String get workerCount => isTamil ? 'தேவையான ஆட்கள் எண்ணிக்கை' : 'Number of Workers Needed';
  static String get dateRequired => isTamil ? 'தேவையான தேதி' : 'Date Required';
  static String get timeRequired => isTamil ? 'தேவையான நேரம்' : 'Time Required';
  static String get duration => isTamil ? 'வேலை காலம்' : 'Duration';
  static String get optionalRate => isTamil ? 'சம்பளம் / கூலி விவரம் (விருப்பப்பட்டால்)' : 'Rate / Budget (Optional)';
  static String get searchSquads => isTamil ? 'வேலைக்குழு தேடவும்' : 'Search Labour Squads';

  // Technician Form
  static String get techFormTitle => isTamil ? 'Technician தேவை பதிவு' : 'Technician Request';
  static String get serviceType => isTamil ? 'சேவை வகை' : 'Service Type';
  static String get problemDetails => isTamil ? 'பிரச்சனை விவரம்' : 'Problem / Work Details';
  static String get urgency => isTamil ? 'அவசரம்' : 'Urgency Level';
  static String get normal => isTamil ? 'சாதாரண (Normal)' : 'Normal';
  static String get urgent => isTamil ? 'மிக அவசரம் (Urgent)' : 'Urgent';
  static String get searchTechnician => isTamil ? 'Technician தேடவும்' : 'Search Technician';

  // Provider Home
  static String get availabilityStatus => isTamil ? 'உங்கள் வேலை நிலை' : 'Your Availability Status';
  static String get availableToday => isTamil ? 'இன்று வேலைக்கு தயார்' : 'Available Today';
  static String get availableDate => isTamil ? 'குறிப்பிட்ட நாளில் தயார்' : 'Available on Date';
  static String get booked => isTamil ? 'வேலையில் உள்ளேன் (Booked)' : 'Booked / Unavailable';

  // Provider Card & Profiles
  static String get squadSize => isTamil ? 'குழு எண்ணிக்கை' : 'Squad Size';
  static String get experience => isTamil ? 'அனுபவம்' : 'Experience';
  static String get radius => isTamil ? 'சேவை சுற்றளவு' : 'Service Radius';
  static String get vouchedBy => isTamil ? 'சான்றளித்தவர்கள்' : 'Vouched By';
  static String get callNow => isTamil ? 'அழைக்கவும் (Call)' : 'Call Now';
  static String get whatsappNow => isTamil ? 'WhatsApp செய்ய' : 'WhatsApp';
  static String get connectNow => isTamil ? 'இணைக்கவும் (Connect)' : 'Connect';
  static String get addVouch => isTamil ? 'நம்பிக்கை சான்று அளிக்கவும்' : 'Vouch For Provider';

  // Offline Notice
  static String get offlineNotice => isTamil 
      ? 'Internet இல்லை — தகவல் சேமிக்கப்பட்டுள்ளது. Internet வந்ததும் அனுப்பப்படும்.'
      : 'Offline mode — data saved locally. Will sync when connected.';

  // Report
  static String get reportProvider => isTamil ? 'புகார் அளிக்கவும்' : 'Report / Block';
  static String get adminDashboard => isTamil ? 'நிர்வாகி பக்கம் (Admin)' : 'Admin Dashboard';
}
